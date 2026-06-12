import { NextRequest, NextResponse } from "next/server";
import {
  deleteIngredientDocument,
  getIngredientDocumentById,
} from "@/lib/data/ingredient-documents";
import { deleteStorageObject } from "@/lib/storage/documents";
import { requireApiAuth } from "@/lib/auth/api-guard";

interface RouteParams {
  params: Promise<{ id: string; docId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const { docId } = await params;
  const doc = await deleteIngredientDocument(docId);
  if (!doc) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    await deleteStorageObject(doc.storagePath);
  } catch {
    // Metadata ya eliminada; objeto huérfano se puede limpiar manualmente
  }

  return NextResponse.json({ ok: true });
}
