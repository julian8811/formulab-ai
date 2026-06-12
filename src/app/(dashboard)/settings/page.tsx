import { AppHeader } from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/guard";
import { getUserOrganizations } from "@/lib/auth/organizations";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const organizations = user ? await getUserOrganizations(user.id) : [];
  const primaryOrg = organizations[0];

  return (
    <div>
      <AppHeader title="Configuración" />
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">Cuenta y organización</p>
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
      </div>
    </div>
  );
}
