"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReformulationSuggestion } from "@/types";
import { Leaf, DollarSign } from "lucide-react";

function SuggestionList({ items }: { items: ReformulationSuggestion[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No hay sugerencias adicionales.</p>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((s, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-2">
          <p className="font-medium text-sm">{s.change}</p>
          {s.impact.sensory && <p className="text-sm">Sensorial: {s.impact.sensory}</p>}
          {s.impact.stability && (
            <p className="text-sm">Estabilidad: {s.impact.stability}</p>
          )}
          {s.impact.cost && <p className="text-sm">Costo: {s.impact.cost}</p>}
          {s.impact.naturalness && (
            <p className="text-sm">Naturalidad: {s.impact.naturalness}</p>
          )}
          {s.impact.claim && <p className="text-sm">Claim: {s.impact.claim}</p>}
        </div>
      ))}
    </div>
  );
}

export function ReformulationPanel({ formulaId }: { formulaId: string }) {
  const [natural, setNatural] = useState<ReformulationSuggestion[]>([]);
  const [cost, setCost] = useState<ReformulationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      setLoading(true);
      try {
        const [naturalRes, costRes] = await Promise.all([
          fetch(`/api/reformulation?formulaId=${formulaId}&goal=natural`),
          fetch(`/api/reformulation?formulaId=${formulaId}&goal=cost`),
        ]);
        const [naturalData, costData] = await Promise.all([
          naturalRes.json(),
          costRes.json(),
        ]);
        if (!cancelled) {
          setNatural(
            Array.isArray(naturalData) ? naturalData : (naturalData.suggestions ?? []),
          );
          setCost(Array.isArray(costData) ? costData : (costData.suggestions ?? []));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [formulaId]);

  return (
    <Tabs defaultValue="natural">
      <TabsList>
        <TabsTrigger value="natural">
          <Leaf className="mr-1 h-4 w-4" />
          Más natural
        </TabsTrigger>
        <TabsTrigger value="cost">
          <DollarSign className="mr-1 h-4 w-4" />
          Bajar costos
        </TabsTrigger>
      </TabsList>
      <TabsContent value="natural" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Reformulación hacia mayor naturalidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Cargando...</p> : <SuggestionList items={natural} />}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="cost" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Optimización de costos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Cargando...</p> : <SuggestionList items={cost} />}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
