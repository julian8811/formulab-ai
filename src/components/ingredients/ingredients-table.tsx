"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SemanticSearchBar } from "@/components/ingredients/semantic-search-bar";
import type { SeedIngredient } from "@/data/seed";
import type { DogCompatibility, Origin } from "@/types";

interface IngredientsTableProps {
  ingredients: SeedIngredient[];
}

export function IngredientsTable({ ingredients }: IngredientsTableProps) {
  const [query, setQuery] = useState("");
  const [semanticIds, setSemanticIds] = useState<string[] | null>(null);
  const [origin, setOrigin] = useState<Origin | "all">("all");
  const [dogFilter, setDogFilter] = useState<DogCompatibility | "all">("all");
  const [functionFilter, setFunctionFilter] = useState("all");

  const functions = useMemo(() => {
    const set = new Set(ingredients.map((i) => i.function));
    return Array.from(set).sort();
  }, [ingredients]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ingredients.filter((ing) => {
      if (semanticIds && !semanticIds.includes(ing.id)) return false;
      if (origin !== "all" && ing.origin !== origin) return false;
      if (dogFilter !== "all" && ing.dogCompatibility !== dogFilter) return false;
      if (functionFilter !== "all" && ing.function !== functionFilter) return false;
      if (!q) return true;
      return (
        ing.inciName.toLowerCase().includes(q) ||
        ing.commonName.toLowerCase().includes(q) ||
        ing.commercialName.toLowerCase().includes(q) ||
        ing.function.toLowerCase().includes(q)
      );
    });
  }, [ingredients, query, origin, dogFilter, functionFilter, semanticIds]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SemanticSearchBar onQueryChange={setQuery} onSemanticResults={setSemanticIds} />
        <Select value={functionFilter} onValueChange={(v) => v && setFunctionFilter(v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Función" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las funciones</SelectItem>
            {functions.map((f) => (
              <SelectItem key={f} value={f}>
                {f.length > 40 ? `${f.slice(0, 40)}…` : f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={origin} onValueChange={(v) => v && setOrigin(v as Origin | "all")}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="vegetal">Vegetal</SelectItem>
            <SelectItem value="synthetic">Sintético</SelectItem>
            <SelectItem value="biotech">Biotec</SelectItem>
            <SelectItem value="mineral">Mineral</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={dogFilter}
          onValueChange={(v) => v && setDogFilter(v as DogCompatibility | "all")}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Perros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="approved">Aprobado</SelectItem>
            <SelectItem value="caution">Precaución</SelectItem>
            <SelectItem value="avoid">Evitar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-base text-muted-foreground">
        {filtered.length} de {ingredients.length} ingredientes
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[220px]">INCI</TableHead>
            <TableHead className="min-w-[140px]">Nombre común</TableHead>
            <TableHead className="min-w-[180px]">Función</TableHead>
            <TableHead className="whitespace-nowrap">Rango %</TableHead>
            <TableHead className="whitespace-nowrap">Perros</TableHead>
            <TableHead className="whitespace-nowrap">Origen</TableHead>
            <TableHead className="whitespace-nowrap text-right">Costo/kg</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((ing) => (
            <TableRow key={ing.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-mono text-sm leading-relaxed whitespace-normal break-words">
                <Link href={`/ingredients/${ing.id}`} className="hover:underline">
                  {ing.inciName}
                </Link>
              </TableCell>
              <TableCell className="whitespace-normal">
                <Link href={`/ingredients/${ing.id}`} className="hover:underline">
                  {ing.commonName}
                </Link>
              </TableCell>
              <TableCell
                className="max-w-[240px] text-sm whitespace-normal text-muted-foreground"
                title={ing.function}
              >
                {ing.function}
              </TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">
                {ing.minPercentage}-{ing.maxPercentage}%
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    ing.dogCompatibility === "approved"
                      ? "default"
                      : ing.dogCompatibility === "caution"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {ing.dogCompatibility}
                </Badge>
              </TableCell>
              <TableCell className="capitalize whitespace-nowrap">{ing.origin}</TableCell>
              <TableCell className="whitespace-nowrap text-right tabular-nums">
                ${ing.costPerKg}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
