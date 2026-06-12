import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface SessionUser {
  id: string;
  email?: string;
}

export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "true" || process.env.DEMO_MODE === "1") {
    return true;
  }
  return !process.env.DATABASE_URL;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  if (isDemoMode() && !isSupabaseConfigured()) {
    return { id: "demo-user" };
  }

  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
