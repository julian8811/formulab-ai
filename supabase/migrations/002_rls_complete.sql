-- RLS completion: ingredient_documents, version/ingredient writes, organizations

ALTER TABLE ingredient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Ingredient documents: authenticated users manage uploads
CREATE POLICY "ingredient_documents_select" ON ingredient_documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ingredient_documents_insert" ON ingredient_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "ingredient_documents_delete" ON ingredient_documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- Formula versions: insert when user owns parent formula
CREATE POLICY "formula_versions_insert" ON formula_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM formulas f
      WHERE f.id = formula_id
        AND (f.user_id IS NULL OR f.user_id = auth.uid())
    )
  );

-- Formula ingredients: insert when user owns parent formula via version
CREATE POLICY "formula_ingredients_insert" ON formula_ingredients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM formula_versions fv
      JOIN formulas f ON f.id = fv.formula_id
      WHERE fv.id = formula_version_id
        AND (f.user_id IS NULL OR f.user_id = auth.uid())
    )
  );

-- Organizations: members can read their org
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.organization_id = organizations.id
        AND m.user_id = auth.uid()
    )
  );

-- Members: users see their own memberships
CREATE POLICY "members_select" ON members
  FOR SELECT USING (user_id = auth.uid());
