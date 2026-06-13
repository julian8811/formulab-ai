import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { BrandLogo } from "@/components/brand/logo";
import {
  ArrowRight,
  Bot,
  FlaskConical,
  Shield,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "Validación técnica",
    text: "pH, incompatibilidades, microbiología y scoring integrado con semáforos.",
    chips: ["INCI-Decoder", "Bio-Stab"],
  },
  {
    icon: Shield,
    title: "Claims seguros",
    text: "Detecta frases de riesgo regulatorio antes del marketing.",
    chips: ["EU · FDA · CAN"],
  },
  {
    icon: Bot,
    title: "IA gratuita",
    text: "Asistente multi-agente con GitHub Models, Gemini o Groq.",
    chips: ["8 agentes"],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen hero-gradient">
      <header className="glass-panel sticky top-0 z-50 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo href="/" size="sm" className="min-w-0 shrink" />
          <div className="flex gap-2">
            <LinkButton href="/login" variant="ghost">
              Entrar
            </LinkButton>
            <LinkButton href="/signup">Registrarse</LinkButton>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center sm:py-28">
          <span className="text-label-caps mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Copiloto de formulación cosmética
          </span>
          <h1 className="text-display-lg font-display text-foreground">
            La ciencia de la{" "}
            <span className="text-primary italic">formulación superior</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            De la idea al prototipo validado: fórmulas, claims seguros, estabilidad,
            costos y documentación PDF. Para productos caninos y humanos.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <LinkButton href="/signup" size="lg" className="gap-2 px-8">
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/login" variant="outline" size="lg" className="px-8">
              Ya tengo cuenta
            </LinkButton>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Excelencia en cada <span className="text-primary">microgramo</span>
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-primary" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text, chips }) => (
              <div key={title} className="glass-card rounded-xl p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-primary/15 bg-muted px-3 py-1 text-xs font-medium text-primary"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="glass-card rounded-2xl p-10 sm:p-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                  Botánica y{" "}
                  <span className="text-primary italic">precisión algorítmica</span>
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Plataforma para formuladores que exigen rigor técnico y estética
                  profesional en cada iteración.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  "Estabilidad y microbiología con alertas accionables",
                  "Costos por escenario: prototipo, piloto y comercial",
                  "Documentación PDF y dossier técnico exportable",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/10 py-10 text-center">
        <p className="text-xs text-muted-foreground">
          No sustituye la evaluación de un químico cosmético o regulador profesional.{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Acceder al dashboard
          </Link>
        </p>
      </footer>
    </div>
  );
}
