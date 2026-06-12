import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { ToolSet } from "ai";

export type AiAuthMethod =
  | "github-models"
  | "gemini"
  | "groq"
  | "openai-direct"
  | "ai-gateway-key"
  | "vercel-oidc"
  | "none";

type GenerateAiTextOptions = {
  system?: string;
  prompt: string;
  tools?: ToolSet;
  maxOutputTokens?: number;
};

const GITHUB_MODELS_BASE = "https://models.github.ai/inference/v1";
const GITHUB_MODEL = "openai/gpt-4.1-mini";

/** Proveedores 100% gratis — sin tarjeta de crédito. */
export function getAvailableAiMethods(): AiAuthMethod[] {
  const methods: AiAuthMethod[] = [];

  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
    methods.push("github-models");
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) {
    methods.push("gemini");
  }
  if (process.env.GROQ_API_KEY) {
    methods.push("groq");
  }

  return methods;
}

export function getAiAuthMethod(): AiAuthMethod {
  return getAvailableAiMethods()[0] ?? "none";
}

export function isAiConfigured(): boolean {
  return getAiAuthMethod() !== "none";
}

function getGithubToken() {
  return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
}

function getGeminiKey() {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
}

function getChatModelFor(method: AiAuthMethod) {
  switch (method) {
    case "github-models": {
      const github = createOpenAI({
        apiKey: getGithubToken(),
        baseURL: GITHUB_MODELS_BASE,
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      return github.chat(GITHUB_MODEL);
    }
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey: getGeminiKey() });
      return google("gemini-2.0-flash");
    }
    case "groq": {
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
      return groq("llama-3.3-70b-versatile");
    }
    default:
      throw new Error(`Proveedor no soportado: ${method}`);
  }
}

export function getChatModel() {
  return getChatModelFor(getAiAuthMethod());
}

export function getEmbeddingModel() {
  const method = getAiAuthMethod();
  if (method === "gemini") {
    const google = createGoogleGenerativeAI({ apiKey: getGeminiKey() });
    return google.textEmbeddingModel("text-embedding-004");
  }
  return undefined;
}

function isFailoverError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /401|403|unauthorized|invalid.*key|insufficient_quota|rate.?limit|credit card|customer_verification|insufficient funds/i.test(
    message,
  );
}

export async function generateAiText(options: GenerateAiTextOptions): Promise<{
  result: Awaited<ReturnType<typeof generateText>>;
  authMethod: AiAuthMethod;
}> {
  const methods = getAvailableAiMethods();
  if (methods.length === 0) {
    throw new Error("Sin proveedor de IA gratuito configurado.");
  }

  let lastError: unknown;

  for (const method of methods) {
    try {
      const result = await generateText({
        ...options,
        model: getChatModelFor(method),
      });
      return { result, authMethod: method };
    } catch (error) {
      lastError = error;
      if (!isFailoverError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export function getAiBillingHint(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);

  if (/401|403|unauthorized/i.test(message)) {
    return "Token inválido o sin permiso `Models: Read`. Crea un PAT en github.com/settings/tokens?scopes=models o usa Gemini/Groq gratis.";
  }

  if (/rate.?limit/i.test(message)) {
    return "Límite de uso gratuito alcanzado. Espera unos minutos o añade un segundo proveedor (Gemini/Groq).";
  }

  return null;
}

export function getFreeSetupHint(): string {
  return `**IA gratis — elige uno (sin tarjeta):**

1. **GitHub Models** (recomendado): PAT con permiso *Models → Read* → \`GITHUB_TOKEN\`
   https://github.com/settings/personal-access-tokens/new

2. **Google Gemini**: key gratis en https://aistudio.google.com/app/apikey → \`GEMINI_API_KEY\`

3. **Groq**: key gratis en https://console.groq.com/keys → \`GROQ_API_KEY\``;
}
