import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  jsonb,
  pgEnum,
  integer,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const ionicChargeEnum = pgEnum("ionic_charge", [
  "anionic",
  "cationic",
  "amphoteric",
  "non_ionic",
]);

export const originEnum = pgEnum("origin", [
  "vegetal",
  "synthetic",
  "biotech",
  "mineral",
]);

export const dogCompatibilityEnum = pgEnum("dog_compatibility", [
  "approved",
  "caution",
  "avoid",
]);

export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high"]);

export const speciesEnum = pgEnum("species", ["dog", "human", "both"]);

export const marketEnum = pgEnum("market", [
  "colombia",
  "can",
  "usa",
  "eu",
  "mexico",
  "brazil",
]);

export const productTypeEnum = pgEnum("product_type", [
  "shampoo",
  "espuma",
  "crema",
  "serum",
  "balm",
  "spray",
  "gel",
  "lotion",
  "tonic",
  "solid",
]);

export const targetAudienceEnum = pgEnum("target_audience", [
  "dog",
  "dog_puppy",
  "dog_sensitive",
  "dog_long_coat",
  "human_adult",
  "human_sensitive",
  "human_oily_hair",
  "human_dry_skin",
]);

export const productFormatEnum = pgEnum("product_format", [
  "liquid",
  "foam",
  "emulsion",
  "gel",
  "solid",
  "spray",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "technical_sheet",
  "sds",
  "coa",
  "ifra",
  "allergen_declaration",
  "formula_master",
  "manufacturing_order",
  "label",
  "checklist",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  commercialName: text("commercial_name").notNull(),
  inciName: text("inci_name").notNull(),
  commonName: text("common_name"),
  function: text("function").notNull(),
  supplier: text("supplier"),
  origin: originEnum("origin").notNull().default("synthetic"),
  ionicCharge: ionicChargeEnum("ionic_charge").notNull().default("non_ionic"),
  minPercentage: numeric("min_percentage", { precision: 6, scale: 3 }),
  maxPercentage: numeric("max_percentage", { precision: 6, scale: 3 }),
  phStabilityMin: numeric("ph_stability_min", { precision: 4, scale: 2 }),
  phStabilityMax: numeric("ph_stability_max", { precision: 4, scale: 2 }),
  solubility: text("solubility"),
  restrictions: text("restrictions"),
  allergens: jsonb("allergens").$type<string[]>().default([]),
  biodegradable: boolean("biodegradable").default(false),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  approvedForHuman: boolean("approved_for_human").default(true),
  recommendedUse: text("recommended_use"),
  dogCompatibility: dogCompatibilityEnum("dog_compatibility")
    .notNull()
    .default("caution"),
  lickRisk: riskLevelEnum("lick_risk").notNull().default("medium"),
  fragranceRisk: riskLevelEnum("fragrance_risk").notNull().default("low"),
  heatSensitive: boolean("heat_sensitive").default(false),
  costPerKg: numeric("cost_per_kg", { precision: 10, scale: 2 }),
  naturalOriginIndex: numeric("natural_origin_index", { precision: 5, scale: 2 }),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingredientDocuments = pgTable("ingredient_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  ingredientId: uuid("ingredient_id")
    .references(() => ingredients.id, { onDelete: "cascade" })
    .notNull(),
  documentType: documentTypeEnum("document_type").notNull(),
  fileName: text("file_name").notNull(),
  storagePath: text("storage_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const incompatibilities = pgTable("incompatibilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  ruleKey: text("rule_key").notNull().unique(),
  ingredientAId: uuid("ingredient_a_id").references(() => ingredients.id),
  ingredientBId: uuid("ingredient_b_id").references(() => ingredients.id),
  ionicChargeA: ionicChargeEnum("ionic_charge_a"),
  ionicChargeB: ionicChargeEnum("ionic_charge_b"),
  category: text("category").notNull(),
  severity: riskLevelEnum("severity").notNull().default("medium"),
  message: text("message").notNull(),
  suggestion: text("suggestion"),
});

export const formulas = pgTable("formulas", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id"),
  name: text("name").notNull(),
  description: text("description"),
  productType: productTypeEnum("product_type").notNull(),
  targetAudience: targetAudienceEnum("target_audience").notNull(),
  productFormat: productFormatEnum("product_format").notNull(),
  positioning: jsonb("positioning").$type<string[]>().default([]),
  targetPh: numeric("target_ph", { precision: 4, scale: 2 }),
  claims: jsonb("claims").$type<string[]>().default([]),
  market: marketEnum("market").default("colombia"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const formulaVersions = pgTable("formula_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  formulaId: uuid("formula_id")
    .references(() => formulas.id, { onDelete: "cascade" })
    .notNull(),
  versionNumber: integer("version_number").notNull().default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const formulaIngredients = pgTable("formula_ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  formulaVersionId: uuid("formula_version_id")
    .references(() => formulaVersions.id, { onDelete: "cascade" })
    .notNull(),
  ingredientId: uuid("ingredient_id")
    .references(() => ingredients.id)
    .notNull(),
  phase: text("phase").notNull().default("A"),
  percentage: numeric("percentage", { precision: 6, scale: 3 }).notNull(),
  functionInFormula: text("function_in_formula"),
  sortOrder: integer("sort_order").default(0),
});

export const claimsRules = pgTable("claims_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  pattern: text("pattern").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  reason: text("reason").notNull(),
  safeAlternative: text("safe_alternative").notNull(),
  market: marketEnum("market"),
  species: speciesEnum("species").notNull().default("both"),
  requiresEvidence: boolean("requires_evidence").default(false),
  evidenceQuestion: text("evidence_question"),
  category: text("category"),
});

export const regulatoryProfiles = pgTable("regulatory_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  market: marketEnum("market").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  labelingRequirements: jsonb("labeling_requirements").$type<string[]>().default([]),
  warnings: jsonb("warnings").$type<string[]>().default([]),
  allowedClaims: jsonb("allowed_claims").$type<string[]>().default([]),
  restrictedClaims: jsonb("restricted_claims").$type<string[]>().default([]),
  productCategories: jsonb("product_categories")
    .$type<Record<string, string>>()
    .default({}),
});

export const stabilityProtocols = pgTable("stability_protocols", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  productFormat: productFormatEnum("product_format"),
  tests: jsonb("tests").$type<string[]>().notNull(),
  description: text("description"),
});

export const microProtocols = pgTable("micro_protocols", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  tests: jsonb("tests").$type<string[]>().notNull(),
  description: text("description"),
});

export const formulaScores = pgTable("formula_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  formulaVersionId: uuid("formula_version_id")
    .references(() => formulaVersions.id, { onDelete: "cascade" })
    .notNull(),
  safety: integer("safety").notNull(),
  stability: integer("stability").notNull(),
  regulatory: integer("regulatory").notNull(),
  naturalness: integer("naturalness").notNull(),
  cost: integer("cost").notNull(),
  sensory: integer("sensory").notNull(),
  microbiologicalRisk: riskLevelEnum("microbiological_risk").notNull(),
  claimsRisk: riskLevelEnum("claims_risk").notNull(),
  summary: text("summary"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const costScenarios = pgTable("cost_scenarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  formulaVersionId: uuid("formula_version_id")
    .references(() => formulaVersions.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  batchSizeKg: numeric("batch_size_kg", { precision: 10, scale: 3 }).notNull(),
  formulaCost: numeric("formula_cost", { precision: 12, scale: 2 }).notNull(),
  packagingCost: numeric("packaging_cost", { precision: 12, scale: 2 }).notNull(),
  wastePercent: numeric("waste_percent", { precision: 5, scale: 2 }).default("5"),
  manufacturingCost: numeric("manufacturing_cost", { precision: 12, scale: 2 }),
  testingCost: numeric("testing_cost", { precision: 12, scale: 2 }),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).notNull(),
  suggestedPrice: numeric("suggested_price", { precision: 12, scale: 2 }),
  marginPercent: numeric("margin_percent", { precision: 5, scale: 2 }),
});

export const generatedDocuments = pgTable("generated_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  formulaVersionId: uuid("formula_version_id")
    .references(() => formulaVersions.id, { onDelete: "cascade" })
    .notNull(),
  documentType: documentTypeEnum("document_type").notNull(),
  fileName: text("file_name").notNull(),
  storagePath: text("storage_path"),
  contentJson: jsonb("content_json"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  documents: many(ingredientDocuments),
  formulaIngredients: many(formulaIngredients),
}));

export const formulasRelations = relations(formulas, ({ many }) => ({
  versions: many(formulaVersions),
}));

export const formulaVersionsRelations = relations(formulaVersions, ({ one, many }) => ({
  formula: one(formulas, {
    fields: [formulaVersions.formulaId],
    references: [formulas.id],
  }),
  ingredients: many(formulaIngredients),
  scores: many(formulaScores),
  costScenarios: many(costScenarios),
  documents: many(generatedDocuments),
}));

export const formulaIngredientsRelations = relations(formulaIngredients, ({ one }) => ({
  version: one(formulaVersions, {
    fields: [formulaIngredients.formulaVersionId],
    references: [formulaVersions.id],
  }),
  ingredient: one(ingredients, {
    fields: [formulaIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));
