import { NextResponse } from "next/server";
import {
  getAiAuthMethod,
  getAvailableAiMethods,
  getFreeSetupHint,
  isAiConfigured,
  probeAiProviders,
} from "@/lib/ai/config";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

  const probe = await probeAiProviders();

  if (probe.ok && probe.workingMethod) {
    return NextResponse.json({
      ok: true,
      mode: "live",
      authMethod: probe.workingMethod,
      availableMethods,
      message: "IA operativa (plan gratuito).",
    });
  }

  const firstError = Object.values(probe.errors)[0] ?? "Todos los proveedores fallaron";

  return NextResponse.json({
    ok: false,
    mode: "demo",
    authMethod,
    availableMethods,
    message: firstError,
    providerErrors: probe.errors,
    setup: getFreeSetupHint(),
  });
}
