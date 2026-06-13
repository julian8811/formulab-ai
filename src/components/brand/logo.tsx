import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizes = {
  sm: { box: "size-9", text: "text-base", tagline: "text-[10px]" },
  md: { box: "size-11", text: "text-lg", tagline: "text-[10px]" },
  lg: { box: "size-14", text: "text-xl", tagline: "text-xs" },
};

export function BrandLogo({
  showTagline = false,
  size = "md",
  href,
  className,
}: BrandLogoProps) {
  const s = sizes[size];
  const content = (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-visible rounded-xl bg-primary/5 ring-1 ring-primary/15",
          s.box,
        )}
      >
        <Image
          src="/brand/logo.png"
          alt="FormuLab AI"
          width={512}
          height={512}
          className="size-[82%] object-contain"
          priority={size === "lg"}
        />
      </div>
      <div className="min-w-0 leading-tight">
        <p
          className={cn(
            "truncate font-display font-semibold tracking-tight text-primary",
            s.text,
          )}
        >
          FormuLab AI
        </p>
        {showTagline && (
          <p
            className={cn(
              "truncate font-semibold uppercase tracking-widest text-muted-foreground",
              s.tagline,
            )}
          >
            Precisión clínica
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block min-w-0 transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
