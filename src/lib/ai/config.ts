import { createOpenAI } from "@ai-sdk/openai";

export const AI_CHAT_MODEL = "openai/gpt-4o-mini";
export const AI_EMBEDDING_MODEL = "openai/text-embedding-3-small";

export type AiAuthMethod = "ai-gateway-key" | "vercel-oidc" | "openai-direct" | "none";

/** OpenAI direct first — works as soon as billing is active on the OpenAI account. */
export function getAiAuthMethod(): AiAuthMethod {
  if (process.env.OPENAI_API_KEY) return "openai-direct";
  if (process.env.AI_GATEWAY_API_KEY) return "ai-gateway-key";
  if (process.env.VERCEL_OIDC_TOKEN) return "vercel-oidc";
  return "none";
}

export function isAiConfigured(): boolean {
  return getAiAuthMethod() !== "none";
}

export function usesAiGateway(): boolean {
  const method = getAiAuthMethod();
  return method === "ai-gateway-key" || method === "vercel-oidc";
}

export function getChatModel() {
  if (usesAiGateway()) {
    return AI_CHAT_MODEL;
  }

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai("gpt-4o-mini");
}

export function getEmbeddingModel() {
  if (usesAiGateway()) {
    return AI_EMBEDDING_MODEL;
  }

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai.embedding("text-embedding-3-small");
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
