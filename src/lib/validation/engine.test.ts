import { describe, it, expect } from "vitest";
import { validateFormula } from "@/lib/validation/engine";
import { seedIngredients, seedIncompatibilities } from "@/data/seed";

describe("validateFormula", () => {
  const water = seedIngredients.find((i) => i.id === "ing-water")!;
  const cocoglucoside = seedIngredients.find((i) => i.id === "ing-cocoglucoside")!;
  const teaTree = seedIngredients.find((i) => i.id === "ing-tea-tree")!;
  const benzoate = seedIngredients.find((i) => i.id === "ing-sodium-benzoate")!;

  it("warns when total percentage is not 100", () => {
    const alerts = validateFormula({
      lines: [
        { ingredientId: "ing-water", ingredient: water, phase: "A", percentage: 50 },
        {
          ingredientId: "ing-cocoglucoside",
          ingredient: cocoglucoside,
          phase: "B",
          percentage: 5,
        },
      ],
      targetAudience: "dog",
      targetPh: 5.5,
      productFormat: "foam",
      incompatibilities: seedIncompatibilities,
    });

    expect(alerts.some((a) => a.id === "total-percentage")).toBe(true);
  });

  it("flags tea tree as avoid for dogs", () => {
    const alerts = validateFormula({
      lines: [
        { ingredientId: "ing-water", ingredient: water, phase: "A", percentage: 99 },
        { ingredientId: "ing-tea-tree", ingredient: teaTree, phase: "C", percentage: 1 },
      ],
      targetAudience: "dog",
      targetPh: 5.5,
      incompatibilities: seedIncompatibilities,
    });

    expect(alerts.some((a) => a.id === "dog-avoid-ing-tea-tree")).toBe(true);
  });

  it("flags missing preservative in aqueous formula", () => {
    const alerts = validateFormula({
      lines: [
        { ingredientId: "ing-water", ingredient: water, phase: "A", percentage: 95 },
        {
          ingredientId: "ing-cocoglucoside",
          ingredient: cocoglucoside,
          phase: "B",
          percentage: 5,
        },
      ],
      targetAudience: "dog",
      targetPh: 5.5,
      incompatibilities: seedIncompatibilities,
    });

    expect(alerts.some((a) => a.id === "micro-no-preservative")).toBe(true);
  });

  it("flags benzoate at high pH", () => {
    const decyl = seedIngredients.find((i) => i.id === "ing-decylglucoside")!;
    const alerts = validateFormula({
      lines: [
        { ingredientId: "ing-water", ingredient: water, phase: "A", percentage: 90 },
        {
          ingredientId: "ing-decylglucoside",
          ingredient: decyl,
          phase: "B",
          percentage: 8,
        },
        {
          ingredientId: "ing-sodium-benzoate",
          ingredient: benzoate,
          phase: "C",
          percentage: 2,
        },
      ],
      targetAudience: "dog",
      targetPh: 7.0,
      incompatibilities: seedIncompatibilities,
    });

    expect(alerts.some((a) => a.category === "microbiology" && a.status === "fail")).toBe(
      true,
    );
  });
});
