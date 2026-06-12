import type { ProductType, TargetAudience, ProductFormat, Positioning } from "@/types";

export interface ProductTemplate {
  productType: ProductType;
  name: string;
  targetAudience: TargetAudience;
  productFormat: ProductFormat;
  positioning: Positioning[];
  targetPh: number;
  ingredients: Array<{
    ingredientId: string;
    phase: string;
    percentage: number;
    functionInFormula: string;
  }>;
}

export const humanProductTemplates: ProductTemplate[] = [
  {
    productType: "crema",
    name: "Crema hidratante facial ligera",
    targetAudience: "human_adult",
    productFormat: "emulsion",
    positioning: ["natural", "paraben_free"],
    targetPh: 5.5,
    ingredients: [
      {
        ingredientId: "ing-water",
        phase: "A",
        percentage: 68,
        functionInFormula: "Vehículo",
      },
      {
        ingredientId: "ing-glycerin",
        phase: "A",
        percentage: 5,
        functionInFormula: "Humectante",
      },
      {
        ingredientId: "ing-hyaluronic",
        phase: "A",
        percentage: 0.5,
        functionInFormula: "Humectante",
      },
      {
        ingredientId: "ing-cetearyl",
        phase: "B",
        percentage: 4,
        functionInFormula: "Emulsificante",
      },
      {
        ingredientId: "ing-sheabutter",
        phase: "B",
        percentage: 8,
        functionInFormula: "Emoliente",
      },
      {
        ingredientId: "ing-squalane",
        phase: "B",
        percentage: 5,
        functionInFormula: "Emoliente ligero",
      },
      {
        ingredientId: "ing-panthenol",
        phase: "C",
        percentage: 1,
        functionInFormula: "Calmante",
      },
      {
        ingredientId: "ing-vitamin-e",
        phase: "C",
        percentage: 0.3,
        functionInFormula: "Antioxidante",
      },
      {
        ingredientId: "ing-phenoxyethanol",
        phase: "C",
        percentage: 0.8,
        functionInFormula: "Conservante",
      },
      {
        ingredientId: "ing-citric-acid",
        phase: "C",
        percentage: 0.1,
        functionInFormula: "Ajuste pH",
      },
    ],
  },
  {
    productType: "serum",
    name: "Sérum facial con niacinamida",
    targetAudience: "human_oily_hair",
    productFormat: "liquid",
    positioning: ["vegan", "paraben_free"],
    targetPh: 5.0,
    ingredients: [
      {
        ingredientId: "ing-water",
        phase: "A",
        percentage: 82,
        functionInFormula: "Vehículo",
      },
      {
        ingredientId: "ing-niacinamide",
        phase: "A",
        percentage: 5,
        functionInFormula: "Activo seborregulador",
      },
      {
        ingredientId: "ing-hyaluronic",
        phase: "A",
        percentage: 1,
        functionInFormula: "Humectante",
      },
      {
        ingredientId: "ing-panthenol",
        phase: "B",
        percentage: 2,
        functionInFormula: "Calmante",
      },
      {
        ingredientId: "ing-allantoin",
        phase: "B",
        percentage: 0.3,
        functionInFormula: "Suavizante",
      },
      {
        ingredientId: "ing-phenoxyethanol",
        phase: "C",
        percentage: 0.8,
        functionInFormula: "Conservante",
      },
      {
        ingredientId: "ing-citric-acid",
        phase: "C",
        percentage: 0.1,
        functionInFormula: "Ajuste pH",
      },
    ],
  },
  {
    productType: "shampoo",
    name: "Shampoo suave sin sulfatos (cabello sensible)",
    targetAudience: "human_sensitive",
    productFormat: "liquid",
    positioning: ["natural", "sulfate_free", "vegan"],
    targetPh: 5.5,
    ingredients: [
      {
        ingredientId: "ing-water",
        phase: "A",
        percentage: 70,
        functionInFormula: "Vehículo",
      },
      {
        ingredientId: "ing-glycerin",
        phase: "A",
        percentage: 3,
        functionInFormula: "Humectante",
      },
      {
        ingredientId: "ing-cocoglucoside",
        phase: "B",
        percentage: 10,
        functionInFormula: "Tensioactivo suave",
      },
      {
        ingredientId: "ing-decylglucoside",
        phase: "B",
        percentage: 5,
        functionInFormula: "Co-tensioactivo",
      },
      {
        ingredientId: "ing-cocamidopropyl",
        phase: "B",
        percentage: 3,
        functionInFormula: "Espuma",
      },
      {
        ingredientId: "ing-panthenol",
        phase: "C",
        percentage: 1,
        functionInFormula: "Condicionante",
      },
      {
        ingredientId: "ing-aloe",
        phase: "C",
        percentage: 1,
        functionInFormula: "Calmante",
      },
      {
        ingredientId: "ing-sodium-benzoate",
        phase: "C",
        percentage: 0.8,
        functionInFormula: "Conservante",
      },
      {
        ingredientId: "ing-citric-acid",
        phase: "C",
        percentage: 0.1,
        functionInFormula: "Ajuste pH",
      },
    ],
  },
  {
    productType: "lotion",
    name: "Loción corporal nutritiva piel seca",
    targetAudience: "human_dry_skin",
    productFormat: "emulsion",
    positioning: ["natural", "dermatologically_tested"],
    targetPh: 5.8,
    ingredients: [
      {
        ingredientId: "ing-water",
        phase: "A",
        percentage: 62,
        functionInFormula: "Vehículo",
      },
      {
        ingredientId: "ing-glycerin",
        phase: "A",
        percentage: 4,
        functionInFormula: "Humectante",
      },
      {
        ingredientId: "ing-cetearyl",
        phase: "B",
        percentage: 5,
        functionInFormula: "Emulsificante",
      },
      {
        ingredientId: "ing-sheabutter",
        phase: "B",
        percentage: 10,
        functionInFormula: "Emoliente",
      },
      {
        ingredientId: "ing-coconut-oil",
        phase: "B",
        percentage: 8,
        functionInFormula: "Nutritivo",
      },
      {
        ingredientId: "ing-squalane",
        phase: "B",
        percentage: 3,
        functionInFormula: "Emoliente ligero",
      },
      {
        ingredientId: "ing-oat",
        phase: "C",
        percentage: 2,
        functionInFormula: "Calmante",
      },
      {
        ingredientId: "ing-phenoxyethanol",
        phase: "C",
        percentage: 0.8,
        functionInFormula: "Conservante",
      },
      {
        ingredientId: "ing-citric-acid",
        phase: "C",
        percentage: 0.1,
        functionInFormula: "Ajuste pH",
      },
    ],
  },
];
