"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectFilterProps {
  projects: Array<{ id: string; name: string }>;
  selectedId?: string;
}

export function ProjectFilter({ projects, selectedId }: ProjectFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("project");
    } else {
      params.set("project", value);
    }
    router.push(`/formulas?${params.toString()}`);
  }

  return (
    <Select value={selectedId ?? "all"} onValueChange={onChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Proyecto" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los proyectos</SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
