import { AppHeader } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormulaSelector } from "@/components/formulas/formula-selector";
import { getFormulas, getFormulaAnalysis } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";
import { resolveProjectFilter } from "@/lib/auth/organizations";
import { seedStabilityProtocols, seedMicroProtocols } from "@/data/seed";
import { ValidationAlertsList } from "@/components/validation/alerts-list";

interface PageProps {
  searchParams: Promise<{ formula?: string; project?: string }>;
}

export default async function StabilityPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const projectId = await resolveProjectFilter(user.id, params.project);
  const formulas = await getFormulas(user.id, projectId);
  const formulaOptions = formulas.map((f) => ({ id: f.id, name: f.name }));
  const selectedId =
    params.formula && formulas.some((f) => f.id === params.formula)
      ? params.formula
      : formulas[0]?.id;

  let stabilityData = null;
  let microData = null;

  if (selectedId) {
    try {
      const analysis = await getFormulaAnalysis(selectedId, { userId: user.id });
      stabilityData = analysis.stability;
      microData = analysis.microbiology;
    } catch {
      stabilityData = null;
      microData = null;
    }
  }

  return (
    <div>
      <AppHeader title="Estabilidad y microbiología" />
      <div className="space-y-6 p-6">
        <FormulaSelector formulas={formulaOptions} selectedId={selectedId} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Módulo de estabilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stabilityData ? (
                <>
                  <p>{stabilityData.summary}</p>
                  <div>
                    <p className="font-medium mb-2">Pruebas recomendadas:</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {stabilityData.recommendedTests.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  {stabilityData.packagingNotes.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Notas de envase:</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {stabilityData.packagingNotes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  Crea una fórmula para ver evaluación.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Módulo microbiológico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {microData ? (
                <>
                  <p>{microData.summary}</p>
                  {microData.requiresChallengeTest && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                      Challenge test obligatorio antes de comercializar.
                    </div>
                  )}
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {microData.recommendedTests.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Crea una fórmula para ver evaluación.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Protocolos disponibles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {seedStabilityProtocols.map((p, i) => (
              <div key={i} className="rounded-lg border p-4">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  {p.tests.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
            {seedMicroProtocols.map((p, i) => (
              <div key={i} className="rounded-lg border p-4">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  {p.tests.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {stabilityData && stabilityData.alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alertas de estabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <ValidationAlertsList alerts={stabilityData.alerts} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
