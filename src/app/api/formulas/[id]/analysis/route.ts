import { NextResponse } from "next/server";
import { getFormulaAnalysis } from "@/lib/actions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const analysis = await getFormulaAnalysis(id);
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 404 },
    );
  }
}
