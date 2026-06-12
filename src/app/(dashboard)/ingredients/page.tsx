import { AppHeader } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllIngredients } from "@/lib/actions";
import { RiskBadge } from "@/components/shared/status-badge";
import { IngredientsSearch } from "@/components/ingredients/ingredients-search";

export default async function IngredientsPage() {
  const ingredients = await getAllIngredients();

  return (
    <div>
      <AppHeader title="Base de ingredientes" />
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            {ingredients.length} materias primas catalogadas
          </p>
          <IngredientsSearch />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingredientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>INCI</TableHead>
                  <TableHead>Nombre común</TableHead>
                  <TableHead>Función</TableHead>
                  <TableHead>Rango %</TableHead>
                  <TableHead>Perros</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Costo/kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => (
                  <TableRow key={ing.id}>
                    <TableCell className="font-mono text-xs">{ing.inciName}</TableCell>
                    <TableCell>{ing.commonName}</TableCell>
                    <TableCell className="text-sm">{ing.function}</TableCell>
                    <TableCell>
                      {ing.minPercentage}-{ing.maxPercentage}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ing.dogCompatibility === "approved"
                            ? "default"
                            : ing.dogCompatibility === "caution"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {ing.dogCompatibility}
                      </Badge>
                    </TableCell>
                    <TableCell>{ing.origin}</TableCell>
                    <TableCell>${ing.costPerKg}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
