import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  createFormulatorTools,
  createRegulatoryTools,
  AGENT_PROMPTS,
} from "@/lib/ai/tools";
import type { AgentType } from "@/types";

const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_GATEWAY_API_KEY ? "https://ai-gateway.vercel.sh/v1" : undefined,
});

export async function runAgent(
  agentType: AgentType,
  userMessage: string,
): Promise<{ text: string; usedTools: boolean }> {
  const model = openai("gpt-4o-mini");

  const systemPrompt =
    AGENT_PROMPTS[agentType as keyof typeof AGENT_PROMPTS] ?? AGENT_PROMPTS.formulator;

  let tools = {};
  if (agentType === "formulator") {
    tools = createFormulatorTools();
  } else if (agentType === "regulatory") {
    tools = createRegulatoryTools();
  } else {
    tools = { ...createFormulatorTools(), ...createRegulatoryTools() };
  }

  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return {
      text: getStubResponse(agentType, userMessage),
      usedTools: false,
    };
  }

  try {
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: userMessage,
      tools,
    });

    return {
      text: result.text,
      usedTools: (result.toolCalls?.length ?? 0) > 0,
    };
  } catch (error) {
    return {
      text: `Error al consultar IA: ${error instanceof Error ? error.message : "Error desconocido"}. Modo demo activo.\n\n${getStubResponse(agentType, userMessage)}`,
      usedTools: false,
    };
  }
}

function getStubResponse(agentType: AgentType, userMessage: string): string {
  const responses: Record<AgentType, string> = {
    formulator: `**Agente Formulador (modo demo)**

Para: "${userMessage.slice(0, 100)}..."

Propongo una fórmula base consultando la BD de ingredientes:

| Fase | Ingrediente | Función | % |
|------|-------------|---------|---|
| A | Agua purificada | Vehículo | 78% |
| A | Glicerina vegetal | Humectante | 3% |
| B | Coco glucósido | Tensioactivo suave | 4% |
| B | Decil glucósido | Espuma suave | 3% |
| C | Aloe vera | Activo botánico | 1% |
| C | Conservante | Protección | 0.8% |

**Alertas:** Revisar pH (objetivo 5.5), fragancia ≤0.2%, challenge test obligatorio.
**Pruebas:** Estabilidad, microbiología, compatibilidad con bomba foamer.

> Configura OPENAI_API_KEY o AI_GATEWAY_API_KEY para respuestas enriquecidas con tools.`,

    regulatory: `**Agente Regulatorio (modo demo)**

Análisis de claims para producto canino:
- ✅ Seguro: "Limpia, refresca, ayuda al cuidado del pelaje"
- ❌ No recomendado: "Antibacterial, antifúngico, cura dermatitis"
- ⚠️ Requiere evidencia: "Dermatológicamente probado"

Categoría legal sugerida: **Grooming aid / producto de limpieza externa**
Mercado Colombia/CAN: Decisión 833 — etiquetado INCI, responsable, lote, vencimiento.`,

    stability: `**Agente Estabilidad (modo demo)**

Protocolo recomendado:
1. pH inicial y final (24h)
2. Viscosidad / fluidez para bomba foamer
3. Estabilidad de espuma
4. Centrifugado / separación de fases
5. Ciclo frío/calor (3 ciclos)
6. Estabilidad acelerada (40°C, 4 semanas)`,

    microbiology: `**Agente Microbiológico (modo demo)**

⚠️ Fórmula con fase acuosa detectada.
- Sistema conservante requerido
- Challenge test obligatorio antes de comercializar
- Monitorear extractos vegetales (carga microbiológica)`,

    costs: `**Agente Costos (modo demo)**

| Escenario | Lote | Costo estimado |
|-----------|------|----------------|
| Prototipo | 1 kg | ~$45 |
| Piloto | 10 kg | ~$280 |
| Comercial | 100 kg | ~$1,850 |

Ingrediente más costoso: revisar extractos y activos premium.`,

    sensory: `**Agente Sensorial (modo demo)**

Perfil sensorial sugerido: espuma cremosa, olor suave, enjuague fácil.
Fragancia: mantener baja concentración para tolerancia canina.`,

    documentation: `**Agente Documentación (modo demo)**

Documentos generables:
- Fórmula maestra
- Orden de fabricación
- Procedimiento de fabricación
- Ficha técnica del producto
- Etiqueta preliminar con INCI
- Checklist regulatorio`,

    market: `**Agente Mercado (modo demo)**

Tendencias grooming canino: natural, sin sulfatos, espumas sin enjuague, bálsamos para almohadillas.
Claims seguros en tendencia: "plant-based", "gentle clean", "paw & coat care".`,
  };

  return responses[agentType] ?? responses.formulator;
}

export async function generateFormulaFromPrompt(prompt: string): Promise<string> {
  return (await runAgent("formulator", prompt)).text;
}
