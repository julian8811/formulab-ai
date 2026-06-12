import { NextRequest, NextResponse } from "next/server";
import { getFormulaAnalysis } from "@/lib/actions";
import { requireApiAuth } from "@/lib/auth/api-guard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const refresh = request.nextUrl.searchParams.get("refresh") === "true";
  const versionParam = request.nextUrl.searchParams.get("version");
  const versionNumber = versionParam ? Number(versionParam) : undefined;

  try {
    const analysis = await getFormulaAnalysis(id, {
      userId: auth.user.id,
      refresh,
      versionNumber: Number.isFinite(versionNumber) ? versionNumber : undefined,
    });
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 404 },
    );
  }
}
