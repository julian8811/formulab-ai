import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormulaSelector } from "@/components/formulas/formula-selector";
import { getFormulas, getFormulaAnalysis } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";
import { resolveProjectFilter } from "@/lib/auth/organizations";

interface PageProps {
  searchParams: Promise<{ formula?: string; project?: string }>;
}

export default async function CostsPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const projectId = await resolveProjectFilter(user.id, params.project);
  const formulas = await getFormulas(user.id, projectId);
  const formulaOptions = formulas.map((f) => ({ id: f.id, name: f.name }));
  const selectedId =
    params.formula && formulas.some((f) => f.id === params.formula)
      ? params.formula
      : formulas[0]?.id;

  let analysis = null;
  if (selectedId) {
    try {
      analysis = await getFormulaAnalysis(selectedId, { userId: user.id });
    } catch {
      analysis = null;
    }
  }

  return (
    <PageShell title="Costos y escalado">
      <FormulaSelector formulas={formulaOptions} selectedId={selectedId} />

      {!analysis ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Crea una fórmula para calcular costos
          </CardContent>
        </Card>
      ) : (
        <Card className="card-table min-w-0">
          <CardHeader>
            <CardTitle>{analysis.formula.name}</CardTitle>
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
                {analysis.costs.map((c) => (
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
                {analysis.expensive.map((e, i) => (
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
      )}
    </PageShell>
  );
}
