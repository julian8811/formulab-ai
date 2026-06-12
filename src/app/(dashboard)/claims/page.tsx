"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskBadge } from "@/components/shared/status-badge";
import type { ClaimValidationResult } from "@/types";
import { Shield } from "lucide-react";

export default function ClaimsPage() {
  const [claim, setClaim] = useState("");
  const [species, setSpecies] = useState<"dog" | "human">("dog");
  const [results, setResults] = useState<ClaimValidationResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function validate() {
    if (!claim.trim()) return;
    setLoading(true);
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim, species }),
    });
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  const examples = [
    "Cura la irritación y elimina hongos en perros.",
    "Dermatológicamente probado.",
    "Limpia y refresca el pelaje suavemente.",
    "Mata pulgas y garrapatas al instante.",
  ];

  return (
    <div>
      <AppHeader title="Validador de claims" />
      <div className="space-y-6 p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Validar claim de marketing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Especie</Label>
              <Select
                value={species}
                onValueChange={(v) => v && setSpecies(v as "dog" | "human")}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Perro</SelectItem>
                  <SelectItem value="human">Humano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Claim a validar</Label>
              <Textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Escribe el claim de marketing..."
                rows={3}
              />
            </div>
            <Button onClick={validate} disabled={loading}>
              {loading ? "Validando..." : "Validar claim"}
            </Button>

            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <Button key={ex} variant="outline" size="sm" onClick={() => setClaim(ex)}>
                  {ex.slice(0, 30)}...
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((r, i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{r.originalClaim}</p>
                    <RiskBadge risk={r.riskLevel} />
                  </div>
                  <p className="text-sm text-muted-foreground">{r.reason}</p>
                  <p className="text-sm">
                    <span className="font-medium">Alternativa segura:</span>{" "}
                    {r.safeAlternative}
                  </p>
                  {r.requiresEvidence && r.evidenceQuestion && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                      ⚠️ {r.evidenceQuestion}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
