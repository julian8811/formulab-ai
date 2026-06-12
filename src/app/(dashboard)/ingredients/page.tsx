import { AppHeader } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { getAllIngredients } from "@/lib/actions";
import { IngredientsTable } from "@/components/ingredients/ingredients-table";
import { EmbeddingStatusBadge } from "@/components/ingredients/embedding-status";
import { Plus } from "lucide-react";

export default async function IngredientsPage() {
  const ingredients = await getAllIngredients();

  return (
    <div>
      <AppHeader title="Base de ingredientes" />
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">
              {ingredients.length} materias primas catalogadas
            </p>
            <EmbeddingStatusBadge />
          </div>
          <LinkButton href="/ingredients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo ingrediente
          </LinkButton>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingredientes</CardTitle>
          </CardHeader>
          <CardContent>
            <IngredientsTable ingredients={ingredients} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
