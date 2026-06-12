import { AppHeader } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRegulatoryProfiles } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { RegulatoryImportPanel } from "@/components/regulatory/import-panel";

export default async function RegulatoryPage() {
  const profiles = await getRegulatoryProfiles();

  return (
    <div>
      <AppHeader title="Módulo regulatorio" />
      <div className="space-y-6 p-6">
        <RegulatoryImportPanel />

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Diferenciación legal importante</AlertTitle>
          <AlertDescription>
            Para perros: &quot;limpia/suaviza/desodoriza&quot; es grooming aid.
            &quot;Cura/elimina hongos/mata pulgas&quot; puede reclasificar como
            medicamento veterinario o pesticida. Productos para mascotas no son cosméticos
            humanos bajo CPR (UE).
          </AlertDescription>
        </Alert>

        <Tabs defaultValue={profiles[0]?.market}>
          <TabsList className="flex-wrap h-auto">
            {profiles.map((p) => (
              <TabsTrigger key={p.market} value={p.market}>
                {p.name.split("—")[0].trim()}
              </TabsTrigger>
            ))}
          </TabsList>

          {profiles.map((profile) => (
            <TabsContent key={profile.market} value={profile.market} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {profile.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{profile.description}</p>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="font-medium mb-2">Categorías de producto</p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <Badge variant="outline">Humano</Badge>{" "}
                        {profile.productCategories.human}
                      </p>
                      <p>
                        <Badge variant="outline">Perro</Badge>{" "}
                        {profile.productCategories.dog}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Etiquetado requerido</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {profile.labelingRequirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2 text-emerald-700">Claims permitidos</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.allowedClaims.map((c, i) => (
                        <Badge key={i} variant="secondary">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-2 text-red-700">Claims restringidos</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.restrictedClaims.map((c, i) => (
                        <Badge key={i} variant="destructive">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium mb-2">Advertencias</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {profile.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
