import { AppHeader } from "@/components/layout/sidebar";
import { FormulaBuilder } from "@/components/formulas/formula-builder";
import { TemplatePicker } from "@/components/formulas/template-picker";
import { getAllIngredients, getProductTemplates } from "@/lib/actions";

interface PageProps {
  searchParams: Promise<{ template?: string }>;
}

export default async function NewFormulaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ingredients = await getAllIngredients();
  const templates = await getProductTemplates();

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
    };
  }

  return (
    <div>
      <AppHeader title="Nueva fórmula" />
      <div className="p-6 max-w-4xl">
        {!params.template && <TemplatePicker templates={templates} />}
        <FormulaBuilder ingredients={ingredients} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
