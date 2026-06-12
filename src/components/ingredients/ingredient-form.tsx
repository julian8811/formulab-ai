"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import type { SeedIngredient } from "@/data/seed";

type IngredientFormValues = Omit<SeedIngredient, "id"> & { id?: string };

interface IngredientFormProps {
  defaultValues?: Partial<IngredientFormValues>;
  ingredientId?: string;
}

export function IngredientForm({ defaultValues, ingredientId }: IngredientFormProps) {
  const router = useRouter();
  const isEdit = Boolean(ingredientId);

  const form = useForm<IngredientFormValues>({
    defaultValues: {
      commercialName: "",
      inciName: "",
      commonName: "",
      function: "",
      supplier: "",
      origin: "synthetic",
      ionicCharge: "non_ionic",
      minPercentage: 0,
      maxPercentage: 100,
      solubility: "",
      allergens: [],
      biodegradable: true,
      certifications: [],
      approvedForHuman: true,
      recommendedUse: "",
      dogCompatibility: "caution",
      lickRisk: "low",
      fragranceRisk: "low",
      heatSensitive: false,
      costPerKg: 0,
      naturalOriginIndex: 0,
      ...defaultValues,
    },
  });

  async function onSubmit(data: IngredientFormValues) {
    try {
      const url = isEdit ? `/api/ingredients/${ingredientId}` : "/api/ingredients";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al guardar");
      }

      const saved = await res.json();
      toast.success(isEdit ? "Ingrediente actualizado" : "Ingrediente creado");
      router.push(`/ingredients/${saved.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Identificación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nombre comercial</Label>
            <Input {...form.register("commercialName", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>INCI</Label>
            <Input {...form.register("inciName", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Nombre común</Label>
            <Input {...form.register("commonName", { required: true })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Función</Label>
            <Input {...form.register("function", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Input {...form.register("supplier")} />
          </div>
          <div className="space-y-2">
            <Label>Origen</Label>
            <Select
              value={form.watch("origin")}
              onValueChange={(v) =>
                v && form.setValue("origin", v as IngredientFormValues["origin"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["vegetal", "synthetic", "biotech", "mineral"].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parámetros técnicos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>% mínimo</Label>
            <Input
              type="number"
              step="0.1"
              {...form.register("minPercentage", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>% máximo</Label>
            <Input
              type="number"
              step="0.1"
              {...form.register("maxPercentage", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>Costo/kg (USD)</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("costPerKg", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>Carga iónica</Label>
            <Select
              value={form.watch("ionicCharge")}
              onValueChange={(v) =>
                v &&
                form.setValue("ionicCharge", v as IngredientFormValues["ionicCharge"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["anionic", "cationic", "amphoteric", "non_ionic"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Compatibilidad perros</Label>
            <Select
              value={form.watch("dogCompatibility")}
              onValueChange={(v) =>
                v &&
                form.setValue(
                  "dogCompatibility",
                  v as IngredientFormValues["dogCompatibility"],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">approved</SelectItem>
                <SelectItem value="caution">caution</SelectItem>
                <SelectItem value="avoid">avoid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Índice origen natural</Label>
            <Input
              type="number"
              {...form.register("naturalOriginIndex", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2 sm:col-span-3">
            <Label>Solubilidad</Label>
            <Input {...form.register("solubility")} />
          </div>
          <div className="space-y-2 sm:col-span-3">
            <Label>Uso recomendado</Label>
            <Textarea {...form.register("recommendedUse")} rows={2} />
          </div>
          <div className="space-y-2 sm:col-span-3">
            <Label>Restricciones</Label>
            <Textarea {...form.register("restrictions")} rows={2} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit">{isEdit ? "Guardar cambios" : "Crear ingrediente"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
