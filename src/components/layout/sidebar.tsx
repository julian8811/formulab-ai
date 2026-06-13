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
  Menu,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/auth/user-menu";
import { BrandLogo } from "@/components/brand/logo";

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
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
              active
                ? "nav-active font-medium"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="glass-sidebar hidden w-64 flex-col border-r lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <BrandLogo showTagline href="/dashboard" size="sm" />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <NavLinks />
      </div>
      <div className="border-t border-sidebar-border p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
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
      <SheetContent side="left" className="glass-sidebar w-64 p-0">
        <div className="flex h-16 items-center border-b px-5">
          <BrandLogo showTagline href="/dashboard" size="sm" />
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
    <header className="glass-panel flex h-16 items-center gap-4 border-b px-4 lg:px-6">
      <MobileNav />
      <Separator orientation="vertical" className="h-6 lg:hidden" />
      <h1 className="flex-1 font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <UserMenu />
    </header>
  );
}
