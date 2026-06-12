"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { SeedIngredient } from "@/data/seed";

const formulaFormSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().optional(),
  productType: z.enum([
    "shampoo",
    "espuma",
    "crema",
    "serum",
    "balm",
    "spray",
    "gel",
    "lotion",
    "tonic",
    "solid",
  ]),
  targetAudience: z.enum([
    "dog",
    "dog_puppy",
    "dog_sensitive",
    "dog_long_coat",
    "human_adult",
    "human_sensitive",
    "human_oily_hair",
    "human_dry_skin",
  ]),
  productFormat: z.enum(["liquid", "foam", "emulsion", "gel", "solid", "spray"]),
  targetPh: z.coerce.number().min(3).max(10).optional(),
  market: z.enum(["colombia", "can", "usa", "eu", "mexico", "brazil"]),
  claims: z.string().optional(),
  lines: z
    .array(
      z.object({
        ingredientId: z.string().min(1),
        phase: z.string(),
        percentage: z.coerce.number().min(0).max(100),
        functionInFormula: z.string().optional(),
      }),
    )
    .min(1),
});

type FormulaFormValues = z.infer<typeof formulaFormSchema>;

interface FormulaBuilderProps {
  ingredients: SeedIngredient[];
  defaultValues?: Partial<FormulaFormValues>;
}

export function FormulaBuilder({ ingredients, defaultValues }: FormulaBuilderProps) {
  const router = useRouter();

  const form = useForm<FormulaFormValues>({
    defaultValues: {
      name: "",
      productType: "espuma",
      targetAudience: "dog",
      productFormat: "foam",
      market: "colombia",
      targetPh: 5.5,
      lines: [
        {
          ingredientId: "ing-water",
          phase: "A",
          percentage: 80,
          functionInFormula: "Vehículo",
        },
      ],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const totalPercentage = form
    .watch("lines")
    .reduce((s, l) => s + (Number(l.percentage) || 0), 0);

  async function onSubmit(data: FormulaFormValues) {
    const parsed = formulaFormSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    try {
      const res = await fetch("/api/formulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          claims: parsed.data.claims?.split("\n").filter(Boolean) ?? [],
        }),
      });

      if (!res.ok) throw new Error("Error al crear fórmula");
      const formula = await res.json();
      toast.success("Fórmula creada");
      router.push(`/formulas/${formula.id}`);
    } catch {
      toast.error("Error al guardar la fórmula");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Definir producto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Espuma limpiadora para perros"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...form.register("description")} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de producto</Label>
            <Select
              value={form.watch("productType")}
              onValueChange={(v) =>
                v && form.setValue("productType", v as FormulaFormValues["productType"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "shampoo",
                  "espuma",
                  "crema",
                  "serum",
                  "balm",
                  "spray",
                  "gel",
                  "lotion",
                  "tonic",
                  "solid",
                ].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Público objetivo</Label>
            <Select
              value={form.watch("targetAudience")}
              onValueChange={(v) =>
                v &&
                form.setValue("targetAudience", v as FormulaFormValues["targetAudience"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Perro</SelectItem>
                <SelectItem value="dog_puppy">Cachorro</SelectItem>
                <SelectItem value="dog_sensitive">Perro piel sensible</SelectItem>
                <SelectItem value="dog_long_coat">Perro pelo largo</SelectItem>
                <SelectItem value="human_adult">Humano adulto</SelectItem>
                <SelectItem value="human_sensitive">Piel sensible</SelectItem>
                <SelectItem value="human_oily_hair">Cabello graso</SelectItem>
                <SelectItem value="human_dry_skin">Piel seca</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Formato</Label>
            <Select
              value={form.watch("productFormat")}
              onValueChange={(v) =>
                v &&
                form.setValue("productFormat", v as FormulaFormValues["productFormat"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["liquid", "foam", "emulsion", "gel", "solid", "spray"].map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPh">pH objetivo</Label>
            <Input
              id="targetPh"
              type="number"
              step="0.1"
              {...form.register("targetPh")}
            />
          </div>
          <div className="space-y-2">
            <Label>Mercado</Label>
            <Select
              value={form.watch("market")}
              onValueChange={(v) =>
                v && form.setValue("market", v as FormulaFormValues["market"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colombia">Colombia</SelectItem>
                <SelectItem value="can">Comunidad Andina</SelectItem>
                <SelectItem value="usa">Estados Unidos</SelectItem>
                <SelectItem value="eu">Unión Europea</SelectItem>
                <SelectItem value="mexico">México</SelectItem>
                <SelectItem value="brazil">Brasil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="claims">Claims (uno por línea)</Label>
            <Textarea
              id="claims"
              {...form.register("claims")}
              placeholder="Limpia y refresca suavemente&#10;Ayuda al cuidado del pelaje"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Composición ({totalPercentage.toFixed(1)}%)</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ ingredientId: "", phase: "A", percentage: 0 })}
          >
            <Plus className="mr-1 h-4 w-4" /> Ingrediente
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-2 rounded-lg border p-3 sm:grid-cols-12"
            >
              <div className="sm:col-span-1">
                <Label className="text-xs">Fase</Label>
                <Input {...form.register(`lines.${index}.phase`)} placeholder="A" />
              </div>
              <div className="sm:col-span-5">
                <Label className="text-xs">Ingrediente</Label>
                <Select
                  value={form.watch(`lines.${index}.ingredientId`)}
                  onValueChange={(v) =>
                    v && form.setValue(`lines.${index}.ingredientId`, v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.commonName} ({ing.inciName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">%</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...form.register(`lines.${index}.percentage`)}
                />
              </div>
              <div className="sm:col-span-3">
                <Label className="text-xs">Función</Label>
                <Input {...form.register(`lines.${index}.functionInFormula`)} />
              </div>
              <div className="flex items-end sm:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {Math.abs(totalPercentage - 100) > 0.5 && (
            <p className="text-sm text-amber-600">
              Total: {totalPercentage.toFixed(1)}% — debe ser ~100%
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit">Crear fórmula</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
