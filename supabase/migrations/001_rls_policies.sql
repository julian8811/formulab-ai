-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- RLS policies (apply after Drizzle migrations create tables)

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE incompatibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_profiles ENABLE ROW LEVEL SECURITY;

-- Public read for reference data (ingredients, rules, regulatory)
CREATE POLICY "ingredients_public_read" ON ingredients FOR SELECT USING (true);
CREATE POLICY "incompatibilities_public_read" ON incompatibilities FOR SELECT USING (true);
CREATE POLICY "claims_rules_public_read" ON claims_rules FOR SELECT USING (true);
CREATE POLICY "regulatory_profiles_public_read" ON regulatory_profiles FOR SELECT USING (true);

-- Formulas: users manage their own (when auth is configured)
CREATE POLICY "formulas_select" ON formulas FOR SELECT USING (
  user_id IS NULL OR user_id = auth.uid()
);
CREATE POLICY "formulas_insert" ON formulas FOR INSERT WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);
CREATE POLICY "formulas_update" ON formulas FOR UPDATE USING (
  user_id IS NULL OR user_id = auth.uid()
);
CREATE POLICY "formulas_delete" ON formulas FOR DELETE USING (
  user_id IS NULL OR user_id = auth.uid()
);

CREATE POLICY "formula_versions_select" ON formula_versions FOR SELECT USING (true);
CREATE POLICY "formula_ingredients_select" ON formula_ingredients FOR SELECT USING (true);
