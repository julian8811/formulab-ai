"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download } from "lucide-react";

interface FormulaOption {
  id: string;
  name: string;
}

export default function DocumentsPageClient() {
  const searchParams = useSearchParams();
  const [formulas, setFormulas] = useState<FormulaOption[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get("formula") ?? "");

  useEffect(() => {
    fetch("/api/formulas")
      .then((r) => r.json())
      .then(setFormulas);
  }, []);

  function downloadPdf() {
    if (!selectedId) return;
    window.open(`/api/documents?formulaId=${selectedId}&format=pdf`, "_blank");
  }

  function downloadJson() {
    if (!selectedId) return;
    window.open(`/api/documents?formulaId=${selectedId}&format=json`, "_blank");
  }

  return (
    <div>
      <AppHeader title="Generador de documentos" />
      <div className="space-y-6 p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exportar dossier técnico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedId} onValueChange={(v) => setSelectedId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar fórmula" />
              </SelectTrigger>
              <SelectContent>
                {formulas.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={downloadPdf} disabled={!selectedId}>
                <Download className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
              <Button variant="outline" onClick={downloadJson} disabled={!selectedId}>
                Exportar JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
