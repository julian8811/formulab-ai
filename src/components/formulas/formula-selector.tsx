"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FormulaOption {
  id: string;
  name: string;
}

interface FormulaSelectorProps {
  formulas: FormulaOption[];
  selectedId?: string;
}

export function FormulaSelector({ formulas, selectedId }: FormulaSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const value = selectedId ?? formulas[0]?.id ?? "";

  function handleChange(formulaId: string | null) {
    if (!formulaId) return;
    router.push(`${pathname}?formula=${formulaId}`);
  }

  if (formulas.length === 0) return null;

  return (
    <div className="space-y-2 max-w-md">
      <Label>Fórmula</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar fórmula" />
        </SelectTrigger>
        <SelectContent>
          {formulas.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
