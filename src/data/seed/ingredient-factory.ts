import type { SeedIngredient } from "./types";

type IngredientInput = Omit<
  SeedIngredient,
  | "allergens"
  | "biodegradable"
  | "certifications"
  | "approvedForHuman"
  | "lickRisk"
  | "fragranceRisk"
  | "heatSensitive"
> &
  Partial<
    Pick<
      SeedIngredient,
      | "allergens"
      | "biodegradable"
      | "certifications"
      | "approvedForHuman"
      | "lickRisk"
      | "fragranceRisk"
      | "heatSensitive"
      | "phStabilityMin"
      | "phStabilityMax"
      | "restrictions"
    >
  >;

export function defineIngredient(input: IngredientInput): SeedIngredient {
  return {
    allergens: [],
    biodegradable: true,
    certifications: [],
    approvedForHuman: true,
    lickRisk: "low",
    fragranceRisk: "low",
    heatSensitive: false,
    ...input,
  };
}
