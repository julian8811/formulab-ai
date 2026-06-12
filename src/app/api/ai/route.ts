import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/ai/orchestrator";
import type { AgentType } from "@/types";

export async function POST(request: NextRequest) {
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
