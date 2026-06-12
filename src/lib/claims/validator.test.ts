import { describe, it, expect } from "vitest";
import { validateClaim, getHighestClaimRisk } from "@/lib/claims/validator";
import { seedClaimRules } from "@/data/seed";

describe("validateClaim", () => {
  it("detects high risk therapeutic claim for dogs", () => {
    const results = validateClaim(
      "Cura la irritación y elimina hongos en perros.",
      seedClaimRules,
      "dog",
    );
    expect(results.some((r) => r.riskLevel === "high")).toBe(true);
  });

  it("detects flea claim as high risk", () => {
    const results = validateClaim(
      "Mata pulgas y garrapatas al instante.",
      seedClaimRules,
      "dog",
    );
    expect(results.some((r) => r.riskLevel === "high")).toBe(true);
  });

  it("allows safe grooming claim", () => {
    const results = validateClaim(
      "Limpia y refresca el pelaje suavemente.",
      seedClaimRules,
      "dog",
    );
    expect(results.every((r) => r.riskLevel === "low")).toBe(true);
  });

  it("requires evidence for dermatologically tested", () => {
    const results = validateClaim("Dermatológicamente probado.", seedClaimRules, "dog");
    expect(results.some((r) => r.requiresEvidence)).toBe(true);
  });

  it("getHighestClaimRisk returns high when present", () => {
    const results = validateClaim(
      "Antibacterial y cura infecciones",
      seedClaimRules,
      "dog",
    );
    expect(getHighestClaimRisk(results)).toBe("high");
  });
});
