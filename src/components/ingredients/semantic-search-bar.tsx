"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Type } from "lucide-react";
import type { SeedIngredient } from "@/data/seed";

type SearchMode = "text" | "semantic";

interface SemanticSearchBarProps {
  onQueryChange?: (query: string) => void;
  onSemanticResults?: (ids: string[] | null) => void;
  placeholder?: string;
}

export function SemanticSearchBar({
  onQueryChange,
  onSemanticResults,
  placeholder = "Buscar INCI, nombre o función...",
}: SemanticSearchBarProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("text");
  const [results, setResults] = useState<SeedIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(
    async (q: string, searchMode: SearchMode) => {
      if (!q.trim()) {
        setResults([]);
        setOpen(false);
        onSemanticResults?.(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/ingredients/search?q=${encodeURIComponent(q)}&mode=${searchMode}`,
        );
        const data = (await res.json()) as SeedIngredient[];
        const list = Array.isArray(data) ? data : [];
        setResults(list);
        setOpen(true);
        if (searchMode === "semantic") {
          onSemanticResults?.(list.map((i) => i.id));
        } else {
          onSemanticResults?.(null);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [onSemanticResults],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onQueryChange?.(query);
      if (query.trim().length >= 2) {
        fetchResults(query, mode);
      } else {
        setResults([]);
        setOpen(false);
        onSemanticResults?.(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, mode, fetchResults, onQueryChange, onSemanticResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleMode() {
    setMode((m) => (m === "text" ? "semantic" : "text"));
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[200px]">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            className="pl-9 pr-3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
          />
        </div>
        <Button
          type="button"
          variant={mode === "semantic" ? "default" : "outline"}
          size="sm"
          onClick={toggleMode}
          title={
            mode === "text"
              ? "Cambiar a búsqueda semántica"
              : "Cambiar a búsqueda por texto"
          }
          className="shrink-0"
        >
          {mode === "semantic" ? (
            <>
              <Sparkles className="mr-1.5 h-4 w-4" />
              Semántica
            </>
          ) : (
            <>
              <Type className="mr-1.5 h-4 w-4" />
              Texto
            </>
          )}
        </Button>
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {loading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.slice(0, 10).map((ing) => (
                <li key={ing.id}>
                  <Link
                    href={`/ingredients/${ing.id}`}
                    className="flex items-start gap-2 px-3 py-2 hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs">{ing.inciName}</p>
                      <p className="truncate text-sm">{ing.commonName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {ing.function}
                      </p>
                    </div>
                    {mode === "semantic" && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        IA
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
