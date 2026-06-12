import { describe, it, expect, afterEach, vi } from "vitest";
import { isFormulasDbAvailable, canAccessFormula } from "@/lib/data/formulas-repository";

vi.mock("@/db", () => ({
  isDatabaseConfigured: vi.fn(() => Boolean(process.env.DATABASE_URL)),
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => [{ userId: "user-a" }],
        }),
      }),
    }),
  }),
}));

describe("isFormulasDbAvailable", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when DATABASE_URL is unset", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(isFormulasDbAvailable()).toBe(false);
  });

  it("returns true when DATABASE_URL is configured", () => {
    vi.stubEnv("DATABASE_URL", "postgres://localhost/test");
    expect(isFormulasDbAvailable()).toBe(true);
  });
});

describe("canAccessFormula", () => {
  it("allows access when no userId filter (demo)", async () => {
    expect(await canAccessFormula("formula-1")).toBe(true);
  });

  it("allows owner access", async () => {
    expect(await canAccessFormula("formula-1", "user-a")).toBe(true);
  });

  it("denies other users", async () => {
    expect(await canAccessFormula("formula-1", "user-b")).toBe(false);
  });
});
