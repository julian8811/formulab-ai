import { describe, it, expect, afterEach, vi } from "vitest";
import { isDemoMode, isProduction } from "@/lib/auth/guard";

describe("isDemoMode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when DEMO_MODE is true", () => {
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("DATABASE_URL", "postgres://localhost/test");
    expect(isDemoMode()).toBe(true);
  });

  it("returns true when DATABASE_URL is unset", () => {
    vi.stubEnv("DEMO_MODE", "");
    vi.stubEnv("DATABASE_URL", "");
    expect(isDemoMode()).toBe(true);
  });

  it("returns false when DATABASE_URL is set and DEMO_MODE is off", () => {
    vi.stubEnv("DEMO_MODE", "");
    vi.stubEnv("DATABASE_URL", "postgres://localhost/test");
    expect(isDemoMode()).toBe(false);
  });
});

describe("isProduction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when NODE_ENV is production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isProduction()).toBe(true);
  });

  it("returns false when NODE_ENV is development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isProduction()).toBe(false);
  });
});
