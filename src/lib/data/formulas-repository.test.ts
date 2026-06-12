import { describe, it, expect, afterEach, vi } from "vitest";
import { isFormulasDbAvailable } from "@/lib/data/formulas-repository";

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
