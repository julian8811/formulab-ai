import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/sidebar";
import { IngredientForm } from "@/components/ingredients/ingredient-form";
import { getIngredientById } from "@/lib/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditIngredientPage({ params }: PageProps) {
  const { id } = await params;
  const ingredient = await getIngredientById(id);
  if (!ingredient) notFound();

  return (
    <div>
      <AppHeader title={`Editar: ${ingredient.commonName}`} />
      <div className="p-6">
        <IngredientForm defaultValues={ingredient} ingredientId={id} />
      </div>
    </div>
  );
}
