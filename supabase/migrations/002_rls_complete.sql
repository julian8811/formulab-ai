-- RLS completion: ingredient_documents, version/ingredient writes, organizations

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
      WHERE f.id = formula_id
        AND (f.user_id IS NULL OR f.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "formula_ingredients_insert" ON formula_ingredients;
CREATE POLICY "formula_ingredients_insert" ON formula_ingredients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM formula_versions fv
      JOIN formulas f ON f.id = fv.formula_id
      WHERE fv.id = formula_version_id
        AND (f.user_id IS NULL OR f.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "organizations_select" ON organizations;
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.organization_id = organizations.id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "members_select" ON members;
CREATE POLICY "members_select" ON members
  FOR SELECT USING (user_id = auth.uid());
