import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getAiAuthMethod, getChatModel, isAiConfigured } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const authMethod = getAiAuthMethod();

  if (!isAiConfigured()) {
    return NextResponse.json({
      ok: false,
      mode: "demo",
      authMethod,
      message: "Sin credenciales de IA configuradas.",
    });
  }

  try {
    await generateText({
      model: getChatModel(),
      prompt: "Responde solo: OK",
      maxOutputTokens: 5,
    });

    return NextResponse.json({
      ok: true,
      mode: "live",
      authMethod,
      message: "IA operativa.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json({
      ok: false,
      mode: "demo",
      authMethod,
      message,
    });
  }
}
