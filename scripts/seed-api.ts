import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import {
  seedIngredients,
  seedIncompatibilities,
  seedClaimRules,
  seedRegulatoryProfiles,
  seedStabilityProtocols,
  seedMicroProtocols,
} from "../src/data/seed";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, key);

async function seed() {
  console.log("Seeding ingredients...");
  const { error: ingError } = await supabase.from("ingredients").upsert(
    seedIngredients.map((ing) => ({
      id: ing.id,
      commercial_name: ing.commercialName,
      inci_name: ing.inciName,
      common_name: ing.commonName,
      function: ing.function,
      supplier: ing.supplier,
      origin: ing.origin,
      ionic_charge: ing.ionicCharge,
      min_percentage: String(ing.minPercentage),
      max_percentage: String(ing.maxPercentage),
      ph_stability_min: ing.phStabilityMin ? String(ing.phStabilityMin) : null,
      ph_stability_max: ing.phStabilityMax ? String(ing.phStabilityMax) : null,
      solubility: ing.solubility,
      restrictions: ing.restrictions ?? null,
      allergens: ing.allergens,
      biodegradable: ing.biodegradable,
      certifications: ing.certifications,
      approved_for_human: ing.approvedForHuman,
      recommended_use: ing.recommendedUse,
      dog_compatibility: ing.dogCompatibility,
      lick_risk: ing.lickRisk,
      fragrance_risk: ing.fragranceRisk,
      heat_sensitive: ing.heatSensitive,
      cost_per_kg: String(ing.costPerKg),
      natural_origin_index: String(ing.naturalOriginIndex),
    })),
    { onConflict: "id" },
  );
  if (ingError) throw ingError;

  console.log("Seeding incompatibilities...");
  const { error: incError } = await supabase.from("incompatibilities").upsert(
    seedIncompatibilities.map((r) => ({
      id: r.id,
      rule_key: r.ruleKey,
      ingredient_a_id: r.ingredientAId ?? null,
      ingredient_b_id: r.ingredientBId ?? null,
      ionic_charge_a: r.ionicChargeA ?? null,
      ionic_charge_b: r.ionicChargeB ?? null,
      category: r.category,
      severity: r.severity,
      message: r.message,
      suggestion: r.suggestion,
    })),
    { onConflict: "id" },
  );
  if (incError) throw incError;

  console.log("Seeding claim rules...");
  const { error: claimError } = await supabase.from("claims_rules").upsert(
    seedClaimRules.map((c) => ({
      id: c.id,
      pattern: c.pattern,
      risk_level: c.riskLevel,
      reason: c.reason,
      safe_alternative: c.safeAlternative,
      species: c.species,
      requires_evidence: c.requiresEvidence,
      evidence_question: c.evidenceQuestion ?? null,
      category: c.category,
    })),
    { onConflict: "id" },
  );
  if (claimError) throw claimError;

  console.log("Seeding regulatory profiles...");
  const { error: regError } = await supabase.from("regulatory_profiles").upsert(
    seedRegulatoryProfiles.map((p) => ({
      market: p.market,
      name: p.name,
      description: p.description,
      labeling_requirements: p.labelingRequirements,
      warnings: p.warnings,
      allowed_claims: p.allowedClaims,
      restricted_claims: p.restrictedClaims,
      product_categories: p.productCategories,
    })),
    { onConflict: "market" },
  );
  if (regError) throw regError;

  console.log("Seeding stability protocols...");
  const { count } = await supabase
    .from("stability_protocols")
    .select("*", { count: "exact", head: true });
  if (!count) {
    const { error: stabError } = await supabase.from("stability_protocols").insert(
      seedStabilityProtocols.map((p) => ({
        name: p.name,
        product_format: p.productFormat,
        tests: p.tests,
        description: p.description,
      })),
    );
    if (stabError) throw stabError;
  }

  console.log("Seeding micro protocols...");
  const { count: microCount } = await supabase
    .from("micro_protocols")
    .select("*", { count: "exact", head: true });
  if (!microCount) {
    const { error: microError } = await supabase.from("micro_protocols").insert(
      seedMicroProtocols.map((p) => ({
        name: p.name,
        tests: p.tests,
        description: p.description,
      })),
    );
    if (microError) throw microError;
  }

  console.log("Seed complete via Supabase REST API!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
