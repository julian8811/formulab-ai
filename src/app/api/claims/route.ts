import { NextRequest, NextResponse } from "next/server";
import { validateClaimsAction } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const { claim, species } = await request.json();
    const results = await validateClaimsAction(claim, species ?? "dog");
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
