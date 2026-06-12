import { NextRequest, NextResponse } from "next/server";
import { createFormula, getFormulas } from "@/lib/actions";

export async function GET() {
  const formulas = await getFormulas();
  return NextResponse.json(formulas);
}

export async function POST(request: NextRequest) {
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
