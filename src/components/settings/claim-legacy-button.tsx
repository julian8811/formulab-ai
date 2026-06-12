"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { claimLegacyFormulasAction } from "@/lib/auth/org-actions";

export function ClaimLegacyButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const { count } = await claimLegacyFormulasAction();
          toast.success(
            count > 0
              ? `${count} fórmula(s) legacy asignadas a tu cuenta`
              : "No hay fórmulas legacy sin dueño",
          );
        })
      }
    >
      Reclamar fórmulas legacy
    </Button>
  );
}
