CREATE TYPE "public"."document_type" AS ENUM('technical_sheet', 'sds', 'coa', 'ifra', 'allergen_declaration', 'formula_master', 'manufacturing_order', 'label', 'checklist');--> statement-breakpoint
CREATE TYPE "public"."dog_compatibility" AS ENUM('approved', 'caution', 'avoid');--> statement-breakpoint
CREATE TYPE "public"."ionic_charge" AS ENUM('anionic', 'cationic', 'amphoteric', 'non_ionic');--> statement-breakpoint
CREATE TYPE "public"."market" AS ENUM('colombia', 'can', 'usa', 'eu', 'mexico', 'brazil');--> statement-breakpoint
CREATE TYPE "public"."origin" AS ENUM('vegetal', 'synthetic', 'biotech', 'mineral');--> statement-breakpoint
CREATE TYPE "public"."product_format" AS ENUM('liquid', 'foam', 'emulsion', 'gel', 'solid', 'spray');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('shampoo', 'espuma', 'crema', 'serum', 'balm', 'spray', 'gel', 'lotion', 'tonic', 'solid');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."species" AS ENUM('dog', 'human', 'both');--> statement-breakpoint
CREATE TYPE "public"."target_audience" AS ENUM('dog', 'dog_puppy', 'dog_sensitive', 'dog_long_coat', 'human_adult', 'human_sensitive', 'human_oily_hair', 'human_dry_skin');--> statement-breakpoint
CREATE TABLE "claims_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern" text NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"reason" text NOT NULL,
	"safe_alternative" text NOT NULL,
	"market" "market",
	"species" "species" DEFAULT 'both' NOT NULL,
	"requires_evidence" boolean DEFAULT false,
	"evidence_question" text,
	"category" text
);
--> statement-breakpoint
CREATE TABLE "cost_scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"formula_version_id" uuid NOT NULL,
	"name" text NOT NULL,
	"batch_size_kg" numeric(10, 3) NOT NULL,
	"formula_cost" numeric(12, 2) NOT NULL,
	"packaging_cost" numeric(12, 2) NOT NULL,
	"waste_percent" numeric(5, 2) DEFAULT '5',
	"manufacturing_cost" numeric(12, 2),
	"testing_cost" numeric(12, 2),
	"total_cost" numeric(12, 2) NOT NULL,
	"suggested_price" numeric(12, 2),
	"margin_percent" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "formula_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"formula_version_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"phase" text DEFAULT 'A' NOT NULL,
	"percentage" numeric(6, 3) NOT NULL,
	"function_in_formula" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "formula_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"formula_version_id" uuid NOT NULL,
	"safety" integer NOT NULL,
	"stability" integer NOT NULL,
	"regulatory" integer NOT NULL,
	"naturalness" integer NOT NULL,
	"cost" integer NOT NULL,
	"sensory" integer NOT NULL,
	"microbiological_risk" "risk_level" NOT NULL,
	"claims_risk" "risk_level" NOT NULL,
	"summary" text,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formula_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"formula_id" uuid NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"user_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"product_type" "product_type" NOT NULL,
	"target_audience" "target_audience" NOT NULL,
	"product_format" "product_format" NOT NULL,
	"positioning" jsonb DEFAULT '[]'::jsonb,
	"target_ph" numeric(4, 2),
	"claims" jsonb DEFAULT '[]'::jsonb,
	"market" "market" DEFAULT 'colombia',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"formula_version_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_name" text NOT NULL,
	"storage_path" text,
	"content_json" jsonb,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incompatibilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_key" text NOT NULL,
	"ingredient_a_id" uuid,
	"ingredient_b_id" uuid,
	"ionic_charge_a" "ionic_charge",
	"ionic_charge_b" "ionic_charge",
	"category" text NOT NULL,
	"severity" "risk_level" DEFAULT 'medium' NOT NULL,
	"message" text NOT NULL,
	"suggestion" text,
	CONSTRAINT "incompatibilities_rule_key_unique" UNIQUE("rule_key")
);
--> statement-breakpoint
CREATE TABLE "ingredient_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_name" text NOT NULL,
	"storage_path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commercial_name" text NOT NULL,
	"inci_name" text NOT NULL,
	"common_name" text,
	"function" text NOT NULL,
	"supplier" text,
	"origin" "origin" DEFAULT 'synthetic' NOT NULL,
	"ionic_charge" "ionic_charge" DEFAULT 'non_ionic' NOT NULL,
	"min_percentage" numeric(6, 3),
	"max_percentage" numeric(6, 3),
	"ph_stability_min" numeric(4, 2),
	"ph_stability_max" numeric(4, 2),
	"solubility" text,
	"restrictions" text,
	"allergens" jsonb DEFAULT '[]'::jsonb,
	"biodegradable" boolean DEFAULT false,
	"certifications" jsonb DEFAULT '[]'::jsonb,
	"approved_for_human" boolean DEFAULT true,
	"recommended_use" text,
	"dog_compatibility" "dog_compatibility" DEFAULT 'caution' NOT NULL,
	"lick_risk" "risk_level" DEFAULT 'medium' NOT NULL,
	"fragrance_risk" "risk_level" DEFAULT 'low' NOT NULL,
	"heat_sensitive" boolean DEFAULT false,
	"cost_per_kg" numeric(10, 2),
	"natural_origin_index" numeric(5, 2),
	"embedding" vector(1536),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "micro_protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tests" jsonb NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regulatory_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market" "market" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"labeling_requirements" jsonb DEFAULT '[]'::jsonb,
	"warnings" jsonb DEFAULT '[]'::jsonb,
	"allowed_claims" jsonb DEFAULT '[]'::jsonb,
	"restricted_claims" jsonb DEFAULT '[]'::jsonb,
	"product_categories" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "regulatory_profiles_market_unique" UNIQUE("market")
);
--> statement-breakpoint
CREATE TABLE "stability_protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"product_format" "product_format",
	"tests" jsonb NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "cost_scenarios" ADD CONSTRAINT "cost_scenarios_formula_version_id_formula_versions_id_fk" FOREIGN KEY ("formula_version_id") REFERENCES "public"."formula_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formula_ingredients" ADD CONSTRAINT "formula_ingredients_formula_version_id_formula_versions_id_fk" FOREIGN KEY ("formula_version_id") REFERENCES "public"."formula_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formula_ingredients" ADD CONSTRAINT "formula_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formula_scores" ADD CONSTRAINT "formula_scores_formula_version_id_formula_versions_id_fk" FOREIGN KEY ("formula_version_id") REFERENCES "public"."formula_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formula_versions" ADD CONSTRAINT "formula_versions_formula_id_formulas_id_fk" FOREIGN KEY ("formula_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_formula_version_id_formula_versions_id_fk" FOREIGN KEY ("formula_version_id") REFERENCES "public"."formula_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incompatibilities" ADD CONSTRAINT "incompatibilities_ingredient_a_id_ingredients_id_fk" FOREIGN KEY ("ingredient_a_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incompatibilities" ADD CONSTRAINT "incompatibilities_ingredient_b_id_ingredients_id_fk" FOREIGN KEY ("ingredient_b_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_documents" ADD CONSTRAINT "ingredient_documents_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;