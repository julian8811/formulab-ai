import { AppHeader } from "@/components/layout/sidebar";
import { FormulaBuilder } from "@/components/formulas/formula-builder";
import { TemplatePicker } from "@/components/formulas/template-picker";
import { getAllIngredients, getProductTemplates } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";
import { getUserOrgContext } from "@/lib/auth/permissions";
import { listOrgProjects, resolveProjectFilter } from "@/lib/auth/organizations";

interface PageProps {
  searchParams: Promise<{ template?: string; project?: string }>;
}

export default async function NewFormulaPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const ingredients = await getAllIngredients();
  const templates = await getProductTemplates();
  const ctx = await getUserOrgContext(user.id);
  const projects = ctx ? await listOrgProjects(ctx.organizationId) : [];
  const defaultProjectId = await resolveProjectFilter(user.id, params.project);

  let defaultValues;
  const templateIndex = params.template ? parseInt(params.template, 10) : -1;
  if (templateIndex >= 0 && templates[templateIndex]) {
    const t = templates[templateIndex];
    defaultValues = {
      name: t.name,
      productType: t.productType,
      targetAudience: t.targetAudience,
      productFormat: t.productFormat,
      targetPh: t.targetPh,
      lines: t.ingredients,
      claims: "Limpia y refresca suavemente\nAyuda al cuidado del pelaje",
      projectId: defaultProjectId,
    };
  } else if (defaultProjectId) {
    defaultValues = { projectId: defaultProjectId };
  }

  return (
    <div>
      <AppHeader title="Nueva fórmula" />
      <div className="p-6 max-w-4xl">
        {!params.template && <TemplatePicker templates={templates} />}
        <FormulaBuilder
          ingredients={ingredients}
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  );
}
