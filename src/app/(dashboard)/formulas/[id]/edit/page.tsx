import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/sidebar";
import { FormulaBuilder } from "@/components/formulas/formula-builder";
import { getFormulaById, getAllIngredients } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFormulaPage({ params }: PageProps) {
  const user = await requireAuth();
  const { id } = await params;
  const formula = await getFormulaById(id, user.id);
  if (!formula) notFound();

  const ingredients = await getAllIngredients();

  const defaultValues = {
    name: formula.name,
    description: formula.description ?? "",
    productType: formula.productType,
    targetAudience: formula.targetAudience,
    productFormat: formula.productFormat,
    targetPh: formula.targetPh,
    market: formula.market,
    claims: formula.claims.join("\n"),
    lines: formula.lines,
  };

  return (
    <div>
      <AppHeader title={`Editar: ${formula.name}`} />
      <div className="p-6 max-w-4xl">
        <FormulaBuilder
          ingredients={ingredients}
          defaultValues={defaultValues}
          formulaId={id}
        />
      </div>
    </div>
  );
}
