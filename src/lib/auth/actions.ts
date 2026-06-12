"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureUserOrganization } from "@/lib/auth/organizations";

export async function signupWithOrganization(
  email: string,
  password: string,
): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureUserOrganization(data.user.id, email);
  }

  return { success: true };
}
