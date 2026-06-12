import { NextRequest, NextResponse } from "next/server";
import { createFormula, getFormulas } from "@/lib/actions";
import { requireApiAuth } from "@/lib/auth/api-guard";

export async function GET() {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const formulas = await getFormulas(auth.user.id);
  return NextResponse.json(formulas);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const formula = await createFormula(body);
    return NextResponse.json(formula, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
