"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Beaker,
  FlaskConical,
  Shield,
  FileText,
  Bot,
  DollarSign,
  Scale,
  LayoutDashboard,
  Database,
  Sparkles,
  Menu,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/auth/user-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/formulas", label: "Fórmulas", icon: FlaskConical },
  { href: "/ingredients", label: "Ingredientes", icon: Database },
  { href: "/validation", label: "Validación", icon: Beaker },
  { href: "/claims", label: "Claims", icon: Shield },
  { href: "/stability", label: "Estabilidad", icon: Scale },
  { href: "/costs", label: "Costos", icon: DollarSign },
  { href: "/regulatory", label: "Regulatorio", icon: Shield },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/ai", label: "Asistente IA", icon: Bot },
  { href: "/settings", label: "Configuración", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === href || pathname.startsWith(href + "/")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <div>
          <p className="font-bold leading-none">FormuLab AI</p>
          <p className="text-xs text-muted-foreground">Copiloto de formulación</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <NavLinks />
      </div>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          No sustituye evaluación profesional de químico/regulador.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex lg:hidden"
        render={<Button variant="ghost" size="icon" />}
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <p className="font-bold">FormuLab AI</p>
        </div>
        <div className="p-4">
          <NavLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <MobileNav />
      <Separator orientation="vertical" className="h-6 lg:hidden" />
      <h1 className="flex-1 text-lg font-semibold">{title}</h1>
      <UserMenu />
    </header>
  );
}
