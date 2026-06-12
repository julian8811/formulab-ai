"use client";

import { useEffect, useState } from "react";
import { ValidationAlertsList } from "@/components/validation/alerts-list";
import { ScoreBar, RiskBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ValidationAlert, FormulaScore } from "@/types";
import { Beaker } from "lucide-react";

interface Props {
  formulas: Array<{ id: string; name: string }>;
  initialFormulaId?: string;
}

export function ValidationPageClient({ formulas, initialFormulaId }: Props) {
  const defaultId = initialFormulaId ?? formulas[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(defaultId);
  const [alerts, setAlerts] = useState<ValidationAlert[]>([]);
  const [score, setScore] = useState<FormulaScore | null>(null);
  const [loading, setLoading] = useState(Boolean(defaultId));

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function loadAnalysis() {
      setLoading(true);
      try {
        const res = await fetch(`/api/formulas/${selectedId}/analysis`);
        const data = await res.json();
        if (!cancelled) {
          setAlerts(data.alerts ?? []);
          setScore(data.score ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Validación técnica con semáforos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedId} onValueChange={(v) => setSelectedId(v ?? "")}>
            <SelectTrigger className="max-w-md">
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
        </CardContent>
      </Card>

      {loading && <p className="text-muted-foreground">Validando...</p>}

      {score && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Puntuación</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ScoreBar label="Seguridad" value={score.safety} />
            <ScoreBar label="Estabilidad" value={score.stability} />
            <ScoreBar label="Regulatorio" value={score.regulatory} />
            <ScoreBar label="Naturalidad" value={score.naturalness} />
            <div className="flex justify-between text-sm sm:col-span-2">
              <span>Riesgo microbiológico</span>
              <RiskBadge risk={score.microbiologicalRisk} />
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && alerts.length > 0 && <ValidationAlertsList alerts={alerts} />}
    </div>
  );
}
