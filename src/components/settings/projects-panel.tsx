"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProject } from "@/lib/auth/organizations";
import { createProjectAction } from "@/lib/auth/org-actions";

interface ProjectsPanelProps {
  projects: UserProject[];
}

export function ProjectsPanel({ projects }: ProjectsPanelProps) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const result = await createProjectAction(name);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Proyecto creado");
      setName("");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="project-name">Nuevo proyecto</Label>
          <Input
            id="project-name"
            placeholder="Línea canina 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} disabled={pending || name.trim().length < 2}>
          Crear
        </Button>
      </div>

      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="rounded-lg border px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{p.name}</p>
                {p.description && (
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                )}
              </div>
              <LinkButton variant="outline" size="sm" href={`/formulas?project=${p.id}`}>
                Ver fórmulas
              </LinkButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
