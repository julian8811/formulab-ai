import { NextResponse } from "next/server";
import { getSessionUser, isDemoMode, type SessionUser } from "@/lib/auth/guard";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { requireCatalogAdmin } from "@/lib/auth/permissions";

export type ApiAuthSuccess = { ok: true; user: SessionUser };
export type ApiAuthFailure = { ok: false; response: NextResponse };

export type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

export async function requireApiAuth(): Promise<ApiAuthResult> {
  if (isDemoMode() && !isSupabaseConfigured()) {
    return { ok: true, user: { id: "demo-user" } };
  }

  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  return { ok: true, user };
}

export async function requireCatalogAdminAuth(): Promise<ApiAuthResult> {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth;

  if (isDemoMode() && !isSupabaseConfigured()) {
    return auth;
  }

  const ctx = await requireCatalogAdmin(auth.user.id);
  if (!ctx) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Solo owner/admin puede modificar el catálogo" },
        { status: 403 },
      ),
    };
  }

  return auth;
}

export async function withApiAuth<T>(
  handler: (user: SessionUser) => Promise<T>,
): Promise<T | NextResponse> {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;
  return handler(auth.user);
}
