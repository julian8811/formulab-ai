import { AppHeader } from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembersPanel } from "@/components/settings/members-panel";
import { ProjectsPanel } from "@/components/settings/projects-panel";
import { ClaimLegacyButton } from "@/components/settings/claim-legacy-button";
import { getSettingsData } from "@/lib/auth/org-actions";

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <div>
      <AppHeader title="Configuración" />
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">Cuenta, organización y proyectos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Correo</p>
            <p>{data.user.email ?? "—"}</p>
          </CardContent>
        </Card>

        {!data.org ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Sin organización vinculada
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="org">
            <TabsList>
              <TabsTrigger value="org">Organización</TabsTrigger>
              {data.isOwner && <TabsTrigger value="members">Miembros</TabsTrigger>}
              {data.isOwner && <TabsTrigger value="projects">Proyectos</TabsTrigger>}
            </TabsList>

            <TabsContent value="org" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{data.org.name}</CardTitle>
                  <CardDescription>Rol: {data.org.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.canManage && (
                    <p className="text-sm text-muted-foreground">
                      Puedes editar el catálogo de ingredientes e importar datos
                      regulatorios.
                    </p>
                  )}
                  <ClaimLegacyButton />
                </CardContent>
              </Card>
            </TabsContent>

            {data.isOwner && (
              <TabsContent value="members" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Miembros</CardTitle>
                    <CardDescription>
                      Invita colegas a tu espacio de trabajo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MembersPanel members={data.members} currentUserId={data.user.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {data.isOwner && (
              <TabsContent value="projects" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Proyectos</CardTitle>
                    <CardDescription>Agrupa fórmulas por línea o cliente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectsPanel projects={data.projects} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}
