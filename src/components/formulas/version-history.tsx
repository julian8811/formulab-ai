"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import type { FormulaVersionSummary } from "@/lib/data/formulas-repository";

interface VersionHistoryProps {
  formulaId: string;
  versions: FormulaVersionSummary[];
  currentVersionNumber: number;
}

export function VersionHistory({
  formulaId,
  versions,
  currentVersionNumber,
}: VersionHistoryProps) {
  if (versions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Historial de versiones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {versions.map((v) => {
            const isCurrent = v.versionNumber === currentVersionNumber;
            return (
              <li key={v.id}>
                <Link
                  href={
                    isCurrent
                      ? `/formulas/${formulaId}`
                      : `/formulas/${formulaId}?version=${v.versionNumber}`
                  }
                  className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50 ${
                    isCurrent ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div>
                    <span className="font-medium">v{v.versionNumber}</span>
                    {v.notes && (
                      <p className="text-muted-foreground text-xs mt-0.5">{v.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <Badge variant="secondary">Actual</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.createdAt).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
