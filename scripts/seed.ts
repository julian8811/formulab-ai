import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import {
  seedIngredients,
  seedIncompatibilities,
  seedClaimRules,
  seedRegulatoryProfiles,
  seedStabilityProtocols,
  seedMicroProtocols,
} from "../src/data/seed";

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL required. Copy .env.example to .env.local");
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("Seeding ingredients...");
  for (const ing of seedIngredients) {
    await db
      .insert(schema.ingredients)
      .values({
        id: ing.id,
        commercialName: ing.commercialName,
        inciName: ing.inciName,
        commonName: ing.commonName,
        function: ing.function,
        supplier: ing.supplier,
        origin: ing.origin,
        ionicCharge: ing.ionicCharge,
        minPercentage: String(ing.minPercentage),
        maxPercentage: String(ing.maxPercentage),
        phStabilityMin: ing.phStabilityMin ? String(ing.phStabilityMin) : null,
        phStabilityMax: ing.phStabilityMax ? String(ing.phStabilityMax) : null,
        solubility: ing.solubility,
        restrictions: ing.restrictions,
        allergens: ing.allergens,
        biodegradable: ing.biodegradable,
        certifications: ing.certifications,
        approvedForHuman: ing.approvedForHuman,
        recommendedUse: ing.recommendedUse,
        dogCompatibility: ing.dogCompatibility,
        lickRisk: ing.lickRisk,
        fragranceRisk: ing.fragranceRisk,
        heatSensitive: ing.heatSensitive,
        costPerKg: String(ing.costPerKg),
        naturalOriginIndex: String(ing.naturalOriginIndex),
      })
      .onConflictDoNothing();
  }

  console.log("Seeding incompatibilities...");
  for (const rule of seedIncompatibilities) {
    await db
      .insert(schema.incompatibilities)
      .values({
        id: rule.id,
        ruleKey: rule.ruleKey,
        ingredientAId: rule.ingredientAId,
        ingredientBId: rule.ingredientBId,
        ionicChargeA: rule.ionicChargeA,
        ionicChargeB: rule.ionicChargeB,
        category: rule.category,
        severity: rule.severity,
        message: rule.message,
        suggestion: rule.suggestion,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding claim rules...");
  for (const claim of seedClaimRules) {
    await db
      .insert(schema.claimsRules)
      .values({
        id: claim.id,
        pattern: claim.pattern,
        riskLevel: claim.riskLevel,
        reason: claim.reason,
        safeAlternative: claim.safeAlternative,
        species: claim.species,
        requiresEvidence: claim.requiresEvidence,
        evidenceQuestion: claim.evidenceQuestion,
        category: claim.category,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding regulatory profiles...");
  for (const profile of seedRegulatoryProfiles) {
    await db
      .insert(schema.regulatoryProfiles)
      .values({
        market: profile.market,
        name: profile.name,
        description: profile.description,
        labelingRequirements: profile.labelingRequirements,
        warnings: profile.warnings,
        allowedClaims: profile.allowedClaims,
        restrictedClaims: profile.restrictedClaims,
        productCategories: profile.productCategories,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding stability protocols...");
  for (const protocol of seedStabilityProtocols) {
    await db.insert(schema.stabilityProtocols).values({
      name: protocol.name,
      productFormat: protocol.productFormat,
      tests: protocol.tests,
      description: protocol.description,
    });
  }

  console.log("Seeding micro protocols...");
  for (const protocol of seedMicroProtocols) {
    await db.insert(schema.microProtocols).values({
      name: protocol.name,
      tests: protocol.tests,
      description: protocol.description,
    });
  }

  console.log("Seed complete!");
  await client.end();
}

seed().catch(console.error);
