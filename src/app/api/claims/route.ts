import { NextRequest, NextResponse } from "next/server";
import { validateClaimsAction } from "@/lib/actions";
import { requireApiAuth } from "@/lib/auth/api-guard";

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

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
