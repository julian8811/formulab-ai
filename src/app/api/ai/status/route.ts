import { NextResponse } from "next/server";
import {
  generateAiText,
  getAiAuthMethod,
  getAvailableAiMethods,
  getFreeSetupHint,
  isAiConfigured,
} from "@/lib/ai/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const availableMethods = getAvailableAiMethods();
  const authMethod = getAiAuthMethod();

  if (!isAiConfigured()) {
    return NextResponse.json({
      ok: false,
      mode: "demo",
      authMethod,
      availableMethods,
      message: "Sin proveedor gratuito configurado.",
      setup: getFreeSetupHint(),
    });
  }

  try {
    const { authMethod: usedMethod } = await generateAiText({
      prompt: "Responde solo: OK",
      maxOutputTokens: 16,
    });

    return NextResponse.json({
      ok: true,
      mode: "live",
      authMethod: usedMethod,
      availableMethods,
      message: "IA operativa (plan gratuito).",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json({
      ok: false,
      mode: "demo",
      authMethod,
      availableMethods,
      message,
      setup: getFreeSetupHint(),
    });
  }
}
