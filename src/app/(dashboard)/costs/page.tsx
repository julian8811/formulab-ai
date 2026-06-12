import { AppHeader } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFormulas, getFormulaAnalysis } from "@/lib/actions";

export default async function CostsPage() {
  const formulas = await getFormulas();
  const analyses = await Promise.all(
    formulas.slice(0, 3).map(async (f) => {
      const analysis = await getFormulaAnalysis(f.id);
      return { ...analysis, formula: f };
    }),
  );

  return (
    <div>
      <AppHeader title="Costos y escalado" />
      <div className="space-y-6 p-6">
        {analyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Crea una fórmula para calcular costos
            </CardContent>
          </Card>
        ) : (
          analyses.map(({ formula, costs, expensive }) => (
            <Card key={formula.id}>
              <CardHeader>
                <CardTitle>{formula.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Escenario</TableHead>
                      <TableHead>Lote (kg)</TableHead>
                      <TableHead>Fórmula</TableHead>
                      <TableHead>Envase</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>$/unidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costs.map((c) => (
                      <TableRow key={c.name}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.batchSizeKg}</TableCell>
                        <TableCell>${c.formulaCost}</TableCell>
                        <TableCell>${c.packagingCost}</TableCell>
                        <TableCell className="font-medium">${c.totalCost}</TableCell>
                        <TableCell>{c.costPerUnit ? `$${c.costPerUnit}` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div>
                  <p className="font-medium mb-2">Ingredientes más costosos</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {expensive.map((e, i) => (
                      <div key={i} className="rounded-lg border p-3 text-sm">
                        <p className="font-medium">{e.name}</p>
                        <p className="text-muted-foreground">
                          {e.percentage}% · ${e.costContribution.toFixed(2)}/kg fórmula
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
