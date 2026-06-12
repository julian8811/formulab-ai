import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getIngredientDocuments,
  saveIngredientDocument,
} from "@/lib/data/ingredient-documents";
import { isProduction } from "@/lib/auth/guard";
import type { DocumentType } from "@/types";

const BUCKET = "ingredient-documents";
const VALID_TYPES: DocumentType[] = [
  "technical_sheet",
  "sds",
  "coa",
  "ifra",
  "allergen_declaration",
];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const docs = await getIngredientDocuments(id);
  return NextResponse.json(docs);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: ingredientId } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as DocumentType;

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(documentType)) {
      return NextResponse.json({ error: "Tipo de documento inválido" }, { status: 400 });
    }

    const storagePath = `${ingredientId}/${Date.now()}-${file.name}`;
    let savedPath = storagePath;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

      if (error) {
        if (isProduction()) {
          return NextResponse.json(
            { error: `Storage: ${error.message}. Verifica bucket ingredient-documents.` },
            { status: 503 },
          );
        }
        savedPath = `local://${storagePath}`;
      }
    } else {
      savedPath = `local://${storagePath}`;
    }

    const doc = await saveIngredientDocument({
      ingredientId,
      documentType,
      fileName: file.name,
      storagePath: savedPath,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al subir" },
      { status: 500 },
    );
  }
}
