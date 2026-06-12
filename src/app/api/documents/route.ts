import { NextRequest, NextResponse } from "next/server";
import { getFormulaAnalysis, getAllIngredients } from "@/lib/actions";
import {
  generateFormulaPdf,
  generateFormulaDocumentJson,
} from "@/lib/documents/pdf-generator";
import { requireApiAuth } from "@/lib/auth/api-guard";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const formulaId = request.nextUrl.searchParams.get("formulaId");
  const format = request.nextUrl.searchParams.get("format") ?? "pdf";

  if (!formulaId) {
    return NextResponse.json({ error: "formulaId requerido" }, { status: 400 });
  }

  try {
    const analysis = await getFormulaAnalysis(formulaId, { userId: auth.user.id });
    const ingredients = await getAllIngredients();

    if (format === "json") {
      const doc = generateFormulaDocumentJson({
        formula: analysis.formula,
        ingredients,
        alerts: analysis.alerts,
        score: analysis.score,
      });
      return NextResponse.json(doc);
    }

    const pdfBuffer = await generateFormulaPdf({
      formula: analysis.formula,
      ingredients,
      alerts: analysis.alerts,
      score: analysis.score,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="formulab-${formulaId}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
