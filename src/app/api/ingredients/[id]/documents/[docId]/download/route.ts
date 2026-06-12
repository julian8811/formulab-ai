import { NextRequest, NextResponse } from "next/server";
import { getIngredientDocumentById } from "@/lib/data/ingredient-documents";
import { createDocumentSignedUrl } from "@/lib/storage/documents";
import { requireApiAuth } from "@/lib/auth/api-guard";

interface RouteParams {
  params: Promise<{ id: string; docId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const { id: ingredientId, docId } = await params;
  const doc = await getIngredientDocumentById(docId);

  if (!doc || doc.ingredientId !== ingredientId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (doc.storagePath.startsWith("local://")) {
    return NextResponse.json(
      { error: "Documento solo disponible en modo demo local" },
      { status: 404 },
    );
  }

  try {
    const url = await createDocumentSignedUrl(doc.storagePath);
    if (!url) {
      return NextResponse.json({ error: "No se pudo generar enlace" }, { status: 503 });
    }
    return NextResponse.json({ url, fileName: doc.fileName });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al descargar" },
      { status: 500 },
    );
  }
}
