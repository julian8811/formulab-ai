"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Send } from "lucide-react";
import type { AgentType } from "@/types";

const agents: { value: AgentType; label: string }[] = [
  { value: "formulator", label: "Agente Formulador" },
  { value: "regulatory", label: "Agente Regulatorio" },
  { value: "stability", label: "Agente Estabilidad" },
  { value: "microbiology", label: "Agente Microbiológico" },
  { value: "costs", label: "Agente Costos" },
  { value: "sensory", label: "Agente Sensorial" },
  { value: "documentation", label: "Agente Documentación" },
  { value: "market", label: "Agente Mercado" },
];

export default function AIPage() {
  const [message, setMessage] = useState(
    "Quiero una espuma limpiadora para perros, sin enjuague, de origen vegetal, para limpiar patas después del paseo.",
  );
  const [agent, setAgent] = useState<AgentType>("formulator");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, agentType: agent }),
    });
    const data = await res.json();
    setResponse(data.text ?? "Sin respuesta");
    setLoading(false);
  }

  return (
    <div>
      <AppHeader title="Asistente IA" />
      <div className="space-y-6 p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agentes especializados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={agent} onValueChange={(v) => v && setAgent(v as AgentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe tu producto o consulta..."
            />

            <Button onClick={send} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Consultando..." : "Consultar agente"}
            </Button>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Respuesta</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm font-sans">{response}</pre>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground">
          La IA trabaja con bases de datos verificables. No inventa seguridad. Configura
          OPENAI_API_KEY o AI_GATEWAY_API_KEY para respuestas enriquecidas con tools.
        </p>
      </div>
    </div>
  );
}
