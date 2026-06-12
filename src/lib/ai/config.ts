import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { ToolSet } from "ai";

export const AI_CHAT_MODEL = "openai/gpt-4o-mini";
export const AI_EMBEDDING_MODEL = "openai/text-embedding-3-small";

export type AiAuthMethod = "ai-gateway-key" | "vercel-oidc" | "openai-direct" | "none";

type GenerateAiTextOptions = {
  system?: string;
  prompt: string;
  tools?: ToolSet;
  maxOutputTokens?: number;
};

export function getAvailableAiMethods(): AiAuthMethod[] {
  const methods: AiAuthMethod[] = [];

  if (process.env.VERCEL === "1" && process.env.VERCEL_OIDC_TOKEN) {
    methods.push("vercel-oidc");
  }
  if (process.env.OPENAI_API_KEY) {
    methods.push("openai-direct");
  }
  if (process.env.AI_GATEWAY_API_KEY) {
    methods.push("ai-gateway-key");
  }
  if (process.env.VERCEL_OIDC_TOKEN && !methods.includes("vercel-oidc")) {
    methods.push("vercel-oidc");
  }

  return methods;
}

export function getAiAuthMethod(): AiAuthMethod {
  return getAvailableAiMethods()[0] ?? "none";
}

export function isAiConfigured(): boolean {
  return getAiAuthMethod() !== "none";
}

function getChatModelFor(method: AiAuthMethod) {
  if (method === "openai-direct") {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai("gpt-4o-mini");
  }

  return AI_CHAT_MODEL;
}

export function getChatModel() {
  return getChatModelFor(getAiAuthMethod());
}

export function getEmbeddingModel() {
  const method = getAiAuthMethod();
  if (method === "openai-direct") {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai.embedding("text-embedding-3-small");
  }

  return AI_EMBEDDING_MODEL;
}

function isFailoverError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /insufficient_quota|exceeded your current quota|credit card|customer_verification_required|insufficient funds/i.test(
    message,
  );
}

export async function generateAiText(
  options: GenerateAiTextOptions,
): Promise<{
  result: Awaited<ReturnType<typeof generateText>>;
  authMethod: AiAuthMethod;
}> {
  const methods = getAvailableAiMethods();
  if (methods.length === 0) {
    throw new Error("Sin credenciales de IA configuradas.");
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

  if (/insufficient_quota|exceeded your current quota/i.test(message)) {
    return "Tu cuenta de OpenAI no tiene crédito activo. Activa billing en platform.openai.com/account/billing.";
  }

  if (/credit card|customer_verification_required/i.test(message)) {
    return "Vercel AI Gateway requiere una tarjeta en vercel.com → AI Gateway → Billing (incluye créditos gratis).";
  }

  if (/insufficient funds/i.test(message)) {
    return "Saldo de Vercel AI Gateway agotado. Recarga créditos o usa OPENAI_API_KEY con billing activo.";
  }

  return null;
}
