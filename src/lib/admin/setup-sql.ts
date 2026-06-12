/** SQL embebido para setup admin (incluido en bundle Vercel). */

export const RLS_001 = `
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE incompatibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ingredients_public_read" ON ingredients;
CREATE POLICY "ingredients_public_read" ON ingredients FOR SELECT USING (true);
DROP POLICY IF EXISTS "incompatibilities_public_read" ON incompatibilities;
CREATE POLICY "incompatibilities_public_read" ON incompatibilities FOR SELECT USING (true);
DROP POLICY IF EXISTS "claims_rules_public_read" ON claims_rules;
CREATE POLICY "claims_rules_public_read" ON claims_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "regulatory_profiles_public_read" ON regulatory_profiles;
CREATE POLICY "regulatory_profiles_public_read" ON regulatory_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "formulas_select" ON formulas;
CREATE POLICY "formulas_select" ON formulas FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
DROP POLICY IF EXISTS "formulas_insert" ON formulas;
CREATE POLICY "formulas_insert" ON formulas FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
DROP POLICY IF EXISTS "formulas_update" ON formulas;
CREATE POLICY "formulas_update" ON formulas FOR UPDATE USING (user_id IS NULL OR user_id = auth.uid());
DROP POLICY IF EXISTS "formulas_delete" ON formulas;
CREATE POLICY "formulas_delete" ON formulas FOR DELETE USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "formula_versions_select" ON formula_versions;
CREATE POLICY "formula_versions_select" ON formula_versions FOR SELECT USING (true);
DROP POLICY IF EXISTS "formula_ingredients_select" ON formula_ingredients;
CREATE POLICY "formula_ingredients_select" ON formula_ingredients FOR SELECT USING (true);
`;

export const RLS_002 = `
ALTER TABLE ingredient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ingredient_documents_select" ON ingredient_documents;
CREATE POLICY "ingredient_documents_select" ON ingredient_documents
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "ingredient_documents_insert" ON ingredient_documents;
CREATE POLICY "ingredient_documents_insert" ON ingredient_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "ingredient_documents_delete" ON ingredient_documents;
CREATE POLICY "ingredient_documents_delete" ON ingredient_documents
  FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "formula_versions_insert" ON formula_versions;
CREATE POLICY "formula_versions_insert" ON formula_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM formulas f
      WHERE f.id = formula_id AND (f.user_id IS NULL OR f.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "formula_ingredients_insert" ON formula_ingredients;
CREATE POLICY "formula_ingredients_insert" ON formula_ingredients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM formula_versions fv
      JOIN formulas f ON f.id = fv.formula_id
      WHERE fv.id = formula_version_id AND (f.user_id IS NULL OR f.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "organizations_select" ON organizations;
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.organization_id = organizations.id AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "members_select" ON members;
CREATE POLICY "members_select" ON members FOR SELECT USING (user_id = auth.uid());
`;

export const STORAGE_POLICIES = `
DROP POLICY IF EXISTS "Authenticated read ingredient docs" ON storage.objects;
CREATE POLICY "Authenticated read ingredient docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ingredient-documents');

DROP POLICY IF EXISTS "Authenticated upload ingredient docs" ON storage.objects;
CREATE POLICY "Authenticated upload ingredient docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ingredient-documents');

DROP POLICY IF EXISTS "Authenticated delete ingredient docs" ON storage.objects;
CREATE POLICY "Authenticated delete ingredient docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ingredient-documents');

DROP POLICY IF EXISTS "Service role full storage" ON storage.objects;
CREATE POLICY "Service role full storage"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'ingredient-documents')
  WITH CHECK (bucket_id = 'ingredient-documents');

DROP POLICY IF EXISTS "organizations_insert" ON organizations;
CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
`;
