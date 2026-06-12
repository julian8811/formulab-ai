import { tool } from "ai";
import { z } from "zod";
import {
  getAllIngredients,
  searchIngredients,
  getAllIncompatibilities,
  getAllClaimRules,
} from "@/lib/data/repository";
import { validateFormula } from "@/lib/validation/engine";
import { validateClaim } from "@/lib/claims/validator";
import { seedRegulatoryProfiles } from "@/data/seed";

export function createFormulatorTools() {
  return {
    searchIngredients: tool({
      description: "Busca ingredientes en la base de datos por nombre, INCI o función",
      inputSchema: z.object({
        query: z.string().describe("Término de búsqueda"),
      }),
      execute: async ({ query }) => {
        const results = await searchIngredients(query);
        return results.slice(0, 10).map((i) => ({
          id: i.id,
          inciName: i.inciName,
          commonName: i.commonName,
          function: i.function,
          minPercentage: i.minPercentage,
          maxPercentage: i.maxPercentage,
          dogCompatibility: i.dogCompatibility,
          costPerKg: i.costPerKg,
        }));
      },
    }),

    getIngredientDetails: tool({
      description: "Obtiene detalles completos de un ingrediente por ID",
      inputSchema: z.object({
        ingredientId: z.string(),
      }),
      execute: async ({ ingredientId }) => {
        const all = await getAllIngredients();
        const ingredient = all.find((i) => i.id === ingredientId);
        if (!ingredient) return { error: "Ingrediente no encontrado" };
        return ingredient;
      },
    }),

    validateFormulaComposition: tool({
      description: "Valida una composición de fórmula con el motor determinista",
      inputSchema: z.object({
        lines: z.array(
          z.object({
            ingredientId: z.string(),
            phase: z.string(),
            percentage: z.number(),
          }),
        ),
        targetAudience: z.enum([
          "dog",
          "dog_puppy",
          "dog_sensitive",
          "dog_long_coat",
          "human_adult",
          "human_sensitive",
        ]),
        targetPh: z.number().optional(),
        productFormat: z.string().optional(),
      }),
      execute: async ({ lines, targetAudience, targetPh, productFormat }) => {
        const allIngredients = await getAllIngredients();
        const incompatibilities = await getAllIncompatibilities();

        const formulaLines = lines
          .map((l) => {
            const ingredient = allIngredients.find((i) => i.id === l.ingredientId);
            if (!ingredient) return null;
            return { ...l, ingredient };
          })
          .filter(Boolean) as Parameters<typeof validateFormula>[0]["lines"];

        const alerts = validateFormula({
          lines: formulaLines,
          targetAudience,
          targetPh,
          productFormat,
          incompatibilities,
        });

        return { alerts, alertCount: alerts.length };
      },
    }),
  };
}

export function createRegulatoryTools() {
  return {
    validateClaimText: tool({
      description: "Valida un claim de marketing contra reglas regulatorias",
      inputSchema: z.object({
        claim: z.string(),
        species: z.enum(["dog", "human"]).default("dog"),
      }),
      execute: async ({ claim, species }) => {
        const rules = await getAllClaimRules();
        return validateClaim(claim, rules, species);
      },
    }),

    getRegulatoryProfile: tool({
      description: "Obtiene perfil regulatorio por mercado",
      inputSchema: z.object({
        market: z.enum(["colombia", "can", "usa", "eu", "mexico", "brazil"]),
      }),
      execute: async ({ market }) => {
        return seedRegulatoryProfiles.find((p) => p.market === market) ?? null;
      },
    }),
  };
}

export const AGENT_PROMPTS = {
  formulator: `Eres el Agente Formulador de FormuLab AI. Propones fórmulas cosméticas basándote EXCLUSIVAMENTE en datos de la base de ingredientes.
Nunca inventes seguridad. Siempre consulta ingredientes con las herramientas disponibles.
Para productos caninos: evita fragancias intensas, aceites esenciales problemáticos, y claims terapéuticos.
Explica por qué usas cada ingrediente, qué riesgo tiene y qué pruebas necesita.
Responde en español.`,

  regulatory: `Eres el Agente Regulatorio de FormuLab AI. Revisas claims, etiquetado y restricciones por mercado.
Diferencia entre cosmético, grooming aid, medicamento veterinario y pesticida.
Para perros: "limpia/suaviza" es seguro; "cura/elimina hongos/mata pulgas" es alto riesgo.
Usa las herramientas para validar claims. Responde en español.`,

  stability: `Eres el Agente de Estabilidad. Detectas riesgos fisicoquímicos: separación de fases, viscosidad, pH, compatibilidad con envase.
Para espumas: evalúa compatibilidad con bomba foamer. Responde en español.`,

  microbiology: `Eres el Agente Microbiológico. Revisas conservación, actividad de agua, riesgo de contaminación.
Productos acuosos requieren challenge test. Responde en español.`,

  costs: `Eres el Agente de Costos. Optimizas materias primas y escenarios de lote.
Identifica ingredientes más costosos y alternativas. Responde en español.`,

  documentation: `Eres el Agente de Documentación. Generas fichas técnicas, procedimientos y checklists desde datos validados.
Responde en español con formato estructurado.`,
};
