import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/ai/orchestrator";
import { requireApiAuth } from "@/lib/auth/api-guard";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import type { AgentType } from "@/types";

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const rl = checkRateLimit(rateLimitKey(request, "api-ai"));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo pronto." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  try {
    const { message, agentType } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const agent = (agentType as AgentType) ?? "formulator";
    const result = await runAgent(agent, message);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 },
    );
  }
}
