import { notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/sidebar";
import { ValidationAlertsList } from "@/components/validation/alerts-list";
import { ScoreBar, RiskBadge } from "@/components/shared/status-badge";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFormulaAnalysis, getAllIngredients } from "@/lib/actions";
import { FileText, RefreshCw } from "lucide-react";
import { ReformulationPanel } from "@/components/formulas/reformulation-panel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormulaDetailPage({ params }: PageProps) {
  const { id } = await params;

  let analysis;
  try {
    analysis = await getFormulaAnalysis(id);
  } catch {
    notFound();
  }

  const { formula, alerts, score, stability, microbiology, costs, claimResults } =
    analysis;
  const ingredients = await getAllIngredients();

  const linesWithNames = formula.lines.map((line) => {
    const ing = ingredients.find((i) => i.id === line.ingredientId);
    return { ...line, ingredient: ing };
  });

  return (
    <div>
      <AppHeader title={formula.name} />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge>{formula.productType}</Badge>
            <Badge variant="outline">{formula.targetAudience}</Badge>
            <Badge variant="secondary">{formula.productFormat}</Badge>
            <Badge variant="outline">pH {formula.targetPh}</Badge>
          </div>
          <div className="flex gap-2">
            <LinkButton href={`/documents?formula=${id}`} variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" /> Documentos
            </LinkButton>
            <LinkButton href={`/validation?formula=${id}`} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Validar
            </LinkButton>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Fórmula maestra</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fase</TableHead>
                    <TableHead>INCI</TableHead>
                    <TableHead>Función</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linesWithNames.map((line, i) => (
                    <TableRow key={i}>
                      <TableCell>{line.phase}</TableCell>
                      <TableCell>
                        {line.ingredient?.inciName ?? line.ingredientId}
                      </TableCell>
                      <TableCell>
                        {line.functionInFormula ?? line.ingredient?.function}
                      </TableCell>
                      <TableCell className="text-right">{line.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Puntuación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreBar label="Seguridad" value={score.safety} />
              <ScoreBar label="Estabilidad" value={score.stability} />
              <ScoreBar label="Regulatorio" value={score.regulatory} />
              <ScoreBar label="Naturalidad" value={score.naturalness} />
              <ScoreBar label="Costo" value={score.cost} />
              <ScoreBar label="Sensorial" value={score.sensory} />
              <div className="flex justify-between text-sm">
                <span>Riesgo microbiológico</span>
                <RiskBadge risk={score.microbiologicalRisk} />
              </div>
              <div className="flex justify-between text-sm">
                <span>Riesgo de claims</span>
                <RiskBadge risk={score.claimsRisk} />
              </div>
              <p className="text-sm text-muted-foreground border-t pt-3">
                {score.summary}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="validation">
          <TabsList>
            <TabsTrigger value="validation">Validación ({alerts.length})</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="stability">Estabilidad</TabsTrigger>
            <TabsTrigger value="costs">Costos</TabsTrigger>
            <TabsTrigger value="reformulation">Reformulación</TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="mt-4">
            <ValidationAlertsList alerts={alerts} />
          </TabsContent>

          <TabsContent value="claims" className="mt-4 space-y-3">
            {claimResults.map((cr, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <p className="font-medium">{cr.originalClaim}</p>
                  <RiskBadge risk={cr.riskLevel} />
                </div>
                <p className="text-sm text-muted-foreground">{cr.reason}</p>
                <p className="text-sm text-primary">Alternativa: {cr.safeAlternative}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="stability" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p>{stability.summary}</p>
                <div>
                  <p className="font-medium mb-2">Pruebas recomendadas:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {stability.recommendedTests.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Microbiología:</p>
                  <p className="text-sm">{microbiology.summary}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escenario</TableHead>
                  <TableHead>Lote (kg)</TableHead>
                  <TableHead>Fórmula</TableHead>
                  <TableHead>Envase</TableHead>
                  <TableHead>Total</TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="reformulation" className="mt-4">
            <ReformulationPanel formulaId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
