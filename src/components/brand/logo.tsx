import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 36, text: "text-lg" },
  lg: { icon: 44, text: "text-xl" },
};

export function BrandLogo({
  showTagline = false,
  size = "md",
  href,
  className,
}: BrandLogoProps) {
  const s = sizes[size];
  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favicon.svg"
          alt=""
          width={s.icon}
          height={s.icon}
          className="h-auto w-auto"
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn("font-display font-semibold tracking-tight text-primary", s.text)}
        >
          FormuLab AI
        </p>
        {showTagline && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Precisión clínica
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
