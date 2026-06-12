import type { ValidationAlert } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const icons = {
  pass: CheckCircle,
  warning: AlertTriangle,
  fail: XCircle,
};

export function ValidationAlertsList({ alerts }: { alerts: ValidationAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Sin alertas</AlertTitle>
        <AlertDescription>
          La fórmula pasó todas las validaciones básicas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = icons[alert.status];
        return (
          <div key={alert.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-medium text-sm">{alert.title}</span>
              </div>
              <StatusBadge status={alert.status} />
            </div>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
            {alert.suggestion && (
              <p className="text-sm text-primary">💡 {alert.suggestion}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
