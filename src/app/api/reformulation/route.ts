import { NextRequest, NextResponse } from "next/server";
import { getReformulationSuggestions } from "@/lib/actions";

export async function GET(request: NextRequest) {
  const formulaId = request.nextUrl.searchParams.get("formulaId");
  const goal = request.nextUrl.searchParams.get("goal") as
    | "natural"
    | "cost"
    | "irritation";

  if (!formulaId || !goal) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
  }

  try {
    const suggestions = await getReformulationSuggestions(formulaId, goal);
    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
