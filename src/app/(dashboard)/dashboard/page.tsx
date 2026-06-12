import Link from "next/link";
import { AppHeader } from "@/components/layout/sidebar";
import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFormulas, getAllIngredients, getProductTemplates } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";
import { FlaskConical, Database, Shield, FileText, Plus, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const formulas = await getFormulas(user.id);
  const ingredients = await getAllIngredients();
  const templates = await getProductTemplates();

  return (
    <div>
      <AppHeader title="Dashboard" />
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">FormuLab AI</h2>
            <p className="text-muted-foreground">
              De la idea cosmética al prototipo validado
            </p>
          </div>
          <LinkButton href="/formulas/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva fórmula
          </LinkButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fórmulas</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formulas.length}</div>
              <p className="text-xs text-muted-foreground">Proyectos activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ingredientes</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ingredients.length}</div>
              <p className="text-xs text-muted-foreground">En base de datos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-muted-foreground">Canino + humano</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Módulos</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-muted-foreground">Validación completa</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas canino + humano</CardTitle>
              <CardDescription>
                Inicia con una fórmula base validada para perros o humanos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <div className="mt-1 flex gap-1">
                      <Badge variant="secondary">{t.productType}</Badge>
                      <Badge variant="outline">{t.targetAudience}</Badge>
                    </div>
                  </div>
                  <LinkButton
                    href={`/formulas/new?template=${i}`}
                    size="sm"
                    variant="outline"
                  >
                    Usar
                  </LinkButton>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accesos rápidos</CardTitle>
              <CardDescription>Módulos principales de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {[
                { href: "/ingredients", label: "Base de ingredientes", icon: Database },
                { href: "/validation", label: "Validador técnico", icon: FlaskConical },
                { href: "/claims", label: "Validador de claims", icon: Shield },
                { href: "/documents", label: "Generador de documentos", icon: FileText },
                { href: "/ai", label: "Asistente IA", icon: Sparkles },
                { href: "/regulatory", label: "Módulo regulatorio", icon: Shield },
              ].map(({ href, label, icon: Icon }) => (
                <LinkButton
                  key={href}
                  href={href}
                  variant="outline"
                  className="justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </LinkButton>
              ))}
            </CardContent>
          </Card>
        </div>

        {formulas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fórmulas recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formulas.slice(0, 5).map((f) => (
                  <Link
                    key={f.id}
                    href={`/formulas/${f.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {f.productType} · {f.targetAudience}
                      </p>
                    </div>
                    <Badge>{f.lines.length} ingredientes</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
