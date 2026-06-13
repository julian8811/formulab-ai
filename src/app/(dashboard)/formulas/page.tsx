import { Suspense } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFormulas } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";
import { getUserOrgContext, canManageCatalog } from "@/lib/auth/permissions";
import { listOrgProjects, resolveProjectFilter } from "@/lib/auth/organizations";
import { ProjectFilter } from "@/components/formulas/project-filter";
import { Plus } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ project?: string }>;
}

export default async function FormulasPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const ctx = await getUserOrgContext(user.id);
  const projects = ctx ? await listOrgProjects(ctx.organizationId) : [];
  const projectId = await resolveProjectFilter(user.id, params.project);

  const formulas = await getFormulas(user.id, projectId);
  const canEditCatalog = ctx ? canManageCatalog(ctx.role) : true;

  return (
    <PageShell title="Fórmulas">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground">{formulas.length} fórmula(s)</p>
          {projects.length > 0 && (
            <Suspense fallback={null}>
              <ProjectFilter projects={projects} selectedId={projectId} />
            </Suspense>
          )}
        </div>
        <LinkButton href="/formulas/new">
          <Plus className="mr-2 h-4 w-4" />
          Nueva fórmula
        </LinkButton>
      </div>

      {formulas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No hay fórmulas en este proyecto</p>
            <LinkButton href="/formulas/new">Crear fórmula</LinkButton>
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

      {!canEditCatalog && (
        <p className="text-xs text-muted-foreground">
          El catálogo de ingredientes es solo lectura para tu rol.
        </p>
      )}
    </PageShell>
  );
}
