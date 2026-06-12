import Link from "next/link";
import { AppHeader } from "@/components/layout/sidebar";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFormulas } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";
import { Plus } from "lucide-react";

export default async function FormulasPage() {
  const user = await requireAuth();
  const formulas = await getFormulas(user.id);

  return (
    <div>
      <AppHeader title="Fórmulas" />
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">{formulas.length} fórmula(s)</p>
          <LinkButton href="/formulas/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva fórmula
          </LinkButton>
        </div>

        {formulas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No hay fórmulas aún</p>
              <LinkButton href="/formulas/new">Crear primera fórmula</LinkButton>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {formulas.map((f) => (
              <Link key={f.id} href={`/formulas/${f.id}`}>
                <Card className="hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{f.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">{f.productType}</Badge>
                      <Badge variant="outline">{f.targetAudience}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {f.lines.length} ingredientes · pH {f.targetPh ?? "—"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
