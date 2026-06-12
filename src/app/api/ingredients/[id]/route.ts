import { NextRequest, NextResponse } from "next/server";
import {
  getIngredientById,
  upsertIngredient,
  deleteIngredient,
} from "@/lib/data/repository";
import { requireApiAuth } from "@/lib/auth/api-guard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const ingredient = await getIngredientById(id);
  if (!ingredient) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(ingredient);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await getIngredientById(id);
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const updated = await upsertIngredient({ ...existing, ...body, id });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await deleteIngredient(id);
  return NextResponse.json({ ok: true });
}
