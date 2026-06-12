import { NextRequest, NextResponse } from "next/server";
import { getAllIngredients, upsertIngredient } from "@/lib/data/repository";
import { z } from "zod";

const ingredientSchema = z.object({
  commercialName: z.string().min(1),
  inciName: z.string().min(1),
  commonName: z.string().min(1),
  function: z.string().min(1),
  supplier: z.string().optional(),
  origin: z.enum(["vegetal", "synthetic", "biotech", "mineral"]),
  ionicCharge: z.enum(["anionic", "cationic", "amphoteric", "non_ionic"]),
  minPercentage: z.number(),
  maxPercentage: z.number(),
  phStabilityMin: z.number().optional(),
  phStabilityMax: z.number().optional(),
  solubility: z.string(),
  restrictions: z.string().optional(),
  allergens: z.array(z.string()).default([]),
  biodegradable: z.boolean().default(true),
  certifications: z.array(z.string()).default([]),
  approvedForHuman: z.boolean().default(true),
  recommendedUse: z.string(),
  dogCompatibility: z.enum(["approved", "caution", "avoid"]),
  lickRisk: z.enum(["low", "medium", "high"]),
  fragranceRisk: z.enum(["low", "medium", "high"]),
  heatSensitive: z.boolean().default(false),
  costPerKg: z.number(),
  naturalOriginIndex: z.number(),
});

export async function GET() {
  const ingredients = await getAllIngredients();
  return NextResponse.json(ingredients);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ingredientSchema.parse(body);
    const ingredient = await upsertIngredient({
      ...data,
      supplier: data.supplier ?? "",
    });
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
