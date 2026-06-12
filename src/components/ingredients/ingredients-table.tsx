"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Search } from "lucide-react";
import type { SeedIngredient } from "@/data/seed";
import type { DogCompatibility, Origin } from "@/types";

interface IngredientsTableProps {
  ingredients: SeedIngredient[];
}

export function IngredientsTable({ ingredients }: IngredientsTableProps) {
  const [query, setQuery] = useState("");
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
  }, [ingredients, query, origin, dogFilter, functionFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar INCI, nombre o función..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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

      <p className="text-sm text-muted-foreground">
        {filtered.length} de {ingredients.length} ingredientes
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>INCI</TableHead>
            <TableHead>Nombre común</TableHead>
            <TableHead>Función</TableHead>
            <TableHead>Rango %</TableHead>
            <TableHead>Perros</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Costo/kg</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((ing) => (
            <TableRow key={ing.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-mono text-xs">
                <Link href={`/ingredients/${ing.id}`} className="hover:underline">
                  {ing.inciName}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/ingredients/${ing.id}`} className="hover:underline">
                  {ing.commonName}
                </Link>
              </TableCell>
              <TableCell className="text-sm max-w-[200px] truncate">
                {ing.function}
              </TableCell>
              <TableCell>
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
              <TableCell>{ing.origin}</TableCell>
              <TableCell>${ing.costPerKg}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
