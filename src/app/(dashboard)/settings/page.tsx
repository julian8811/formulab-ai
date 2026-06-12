import { AppHeader } from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/guard";
import { getUserOrganizations, getUserDefaultProject } from "@/lib/auth/organizations";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const organizations = user ? await getUserOrganizations(user.id) : [];
  const primaryOrg = organizations[0];
  const defaultProject = user ? await getUserDefaultProject(user.id) : undefined;

  return (
    <div>
      <AppHeader title="Configuración" />
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">Cuenta, organización y proyecto</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
            <CardDescription>Información de tu sesión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Correo</p>
              <p className="text-base">{user?.email ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organización</CardTitle>
            <CardDescription>Espacio de trabajo asociado a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-base">{primaryOrg?.name ?? "Sin organización"}</p>
            </div>
            {primaryOrg && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rol</p>
                <p className="text-base capitalize">{primaryOrg.role}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proyecto</CardTitle>
            <CardDescription>
              Las nuevas fórmulas se asocian a este proyecto por defecto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-base">{defaultProject?.name ?? "Sin proyecto"}</p>
            </div>
            {defaultProject?.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-base text-muted-foreground">
                  {defaultProject.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
