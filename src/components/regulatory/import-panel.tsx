"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Database } from "lucide-react";

export function RegulatoryImportPanel() {
  const [loading, setLoading] = useState<"cosing" | "ifra" | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleImport(source: "cosing" | "ifra") {
    setLoading(source);
    setResult(null);
    try {
      const res = await fetch("/api/regulatory/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      const msg = `Importados: ${data.imported}, omitidos: ${data.skipped}`;
      setResult(msg);
      toast.success(msg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error de importación");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Importar bases regulatorias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Importa referencias de CosIng (UE) e IFRA (fragancias) a la base de
          ingredientes. Los duplicados por INCI se omiten automáticamente.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleImport("cosing")}
            disabled={loading !== null}
          >
            <Download className="mr-2 h-4 w-4" />
            {loading === "cosing" ? "Importando CosIng..." : "Importar CosIng (muestra)"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleImport("ifra")}
            disabled={loading !== null}
          >
            <Download className="mr-2 h-4 w-4" />
            {loading === "ifra" ? "Importando IFRA..." : "Importar IFRA (muestra)"}
          </Button>
        </div>
        {result && <p className="text-sm text-emerald-700">{result}</p>}
      </CardContent>
    </Card>
  );
}
