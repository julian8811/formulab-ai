import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth/guard", () => ({
  getSessionUser: vi.fn(),
  isDemoMode: vi.fn(() => false),
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

import { getSessionUser } from "@/lib/auth/guard";
import { requireApiAuth } from "@/lib/auth/api-guard";

describe("requireApiAuth", () => {
  beforeEach(() => {
    vi.mocked(getSessionUser).mockReset();
  });

  it("returns 401 when no session", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const result = await requireApiAuth();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response).toBeInstanceOf(NextResponse);
      expect(result.response.status).toBe(401);
    }
  });

  it("returns user when session exists", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ id: "user-1", email: "a@test.com" });
    const result = await requireApiAuth();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.id).toBe("user-1");
    }
  });
});
