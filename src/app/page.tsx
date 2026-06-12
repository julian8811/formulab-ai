import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { Sparkles, FlaskConical, Shield, Bot } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold">FormuLab AI</span>
          </div>
          <div className="flex gap-2">
            <LinkButton href="/login" variant="ghost">
              Entrar
            </LinkButton>
            <LinkButton href="/signup">Registrarse</LinkButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Copiloto de formulación cosmética
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            De la idea al prototipo validado: fórmulas, claims seguros, estabilidad,
            costos y documentación PDF. Para productos caninos y humanos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href="/signup" size="lg">
              Empezar gratis
            </LinkButton>
            <LinkButton href="/login" variant="outline" size="lg">
              Ya tengo cuenta
            </LinkButton>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: FlaskConical,
              title: "Validación técnica",
              text: "pH, incompatibilidades, microbiología y scoring integrado.",
            },
            {
              icon: Shield,
              title: "Claims seguros",
              text: "Detecta frases de riesgo regulatorio antes del marketing.",
            },
            {
              icon: Bot,
              title: "IA gratuita",
              text: "Asistente multi-agente con GitHub Models, Gemini o Groq.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <Icon className="mb-3 h-8 w-8 text-primary" />
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          No sustituye la evaluación de un químico cosmético o regulador profesional.{" "}
          <Link href="/login" className="underline">
            Acceder al dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
