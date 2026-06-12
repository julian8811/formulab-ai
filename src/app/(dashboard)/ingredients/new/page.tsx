import { AppHeader } from "@/components/layout/sidebar";
import { IngredientForm } from "@/components/ingredients/ingredient-form";

export default function NewIngredientPage() {
  return (
    <div>
      <AppHeader title="Nuevo ingrediente" />
      <div className="p-6">
        <IngredientForm />
      </div>
    </div>
  );
}
