import { NextRequest, NextResponse } from "next/server";
import { deleteIngredientDocument } from "@/lib/data/ingredient-documents";

interface RouteParams {
  params: Promise<{ id: string; docId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { docId } = await params;
  await deleteIngredientDocument(docId);
  return NextResponse.json({ ok: true });
}
