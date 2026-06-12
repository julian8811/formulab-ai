import { notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/sidebar";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getIngredientById } from "@/lib/actions";
import { getIngredientDocuments } from "@/lib/data/ingredient-documents";
import { IngredientDocumentsSection } from "@/components/ingredients/ingredient-documents-section";
import { RiskBadge } from "@/components/shared/status-badge";
import { Pencil } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IngredientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ingredient = await getIngredientById(id);
  if (!ingredient) notFound();

  const documents = await getIngredientDocuments(id);

  return (
    <div>
      <AppHeader title={ingredient.commonName} />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono">
              {ingredient.inciName}
            </Badge>
            <Badge>{ingredient.origin}</Badge>
            <Badge variant="secondary">{ingredient.ionicCharge}</Badge>
          </div>
          <LinkButton href={`/ingredients/${id}/edit`} size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </LinkButton>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Nombre comercial</span>
                <span>{ingredient.commercialName}</span>
                <span className="text-muted-foreground">Proveedor</span>
                <span>{ingredient.supplier || "—"}</span>
                <span className="text-muted-foreground">Función</span>
                <span>{ingredient.function}</span>
                <span className="text-muted-foreground">Solubilidad</span>
                <span>{ingredient.solubility}</span>
                <span className="text-muted-foreground">Rango de uso</span>
                <span>
                  {ingredient.minPercentage}–{ingredient.maxPercentage}%
                </span>
                <span className="text-muted-foreground">Costo/kg</span>
                <span>${ingredient.costPerKg}</span>
                <span className="text-muted-foreground">Origen natural</span>
                <span>{ingredient.naturalOriginIndex}%</span>
              </div>
              {ingredient.recommendedUse && (
                <div>
                  <p className="text-muted-foreground mb-1">Uso recomendado</p>
                  <p>{ingredient.recommendedUse}</p>
                </div>
              )}
              {ingredient.restrictions && (
                <div>
                  <p className="text-muted-foreground mb-1">Restricciones</p>
                  <p className="text-amber-700">{ingredient.restrictions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguridad y compatibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Perros</span>
                <Badge
                  variant={
                    ingredient.dogCompatibility === "approved"
                      ? "default"
                      : ingredient.dogCompatibility === "caution"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {ingredient.dogCompatibility}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Riesgo por lamido</span>
                <RiskBadge risk={ingredient.lickRisk} />
              </div>
              <div className="flex justify-between">
                <span>Riesgo fragancia</span>
                <RiskBadge risk={ingredient.fragranceRisk} />
              </div>
              <div className="flex justify-between">
                <span>Aprobado humano</span>
                <span>{ingredient.approvedForHuman ? "Sí" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span>Biodegradable</span>
                <span>{ingredient.biodegradable ? "Sí" : "No"}</span>
              </div>
              {ingredient.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {ingredient.certifications.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}
              {ingredient.allergens.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Alérgenos</p>
                  <p>{ingredient.allergens.join(", ")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <IngredientDocumentsSection ingredientId={id} documents={documents} />

        <p className="text-sm">
          <Link href="/ingredients" className="text-primary hover:underline">
            ← Volver al catálogo
          </Link>
        </p>
      </div>
    </div>
  );
}
