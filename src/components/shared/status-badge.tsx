import { cn } from "@/lib/utils";
import type { ValidationStatus, RiskLevel } from "@/types";

const statusStyles: Record<ValidationStatus, string> = {
  pass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  fail: "bg-red-100 text-red-800 border-red-200",
};

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export function StatusBadge({
  status,
  label,
}: {
  status: ValidationStatus;
  label?: string;
}) {
  const labels: Record<ValidationStatus, string> = {
    pass: "OK",
    warning: "Advertencia",
    fail: "Crítico",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {label ?? labels[status]}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const labels: Record<RiskLevel, string> = {
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        riskStyles[risk],
      )}
    >
      {labels[risk]}
    </span>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
