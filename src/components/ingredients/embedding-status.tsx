import { isDatabaseConfigured, getDb } from "@/db";
import { ingredients } from "@/db/schema";
import { hasRealEmbeddingModel } from "@/lib/ai/config";
import { sql, isNotNull } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle } from "lucide-react";

export interface EmbeddingStatus {
  mode: "demo" | "real" | "pseudo";
  total?: number;
  withEmbeddings?: number;
}

export async function getEmbeddingStatus(): Promise<EmbeddingStatus> {
  if (!isDatabaseConfigured()) {
    return { mode: "demo" };
  }

  if (hasRealEmbeddingModel()) {
    return { mode: "real" };
  }

  const db = getDb();
  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ingredients);
  const [withRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ingredients)
    .where(isNotNull(ingredients.embedding));

  return {
    mode: "pseudo",
    total: totalRow?.count ?? 0,
    withEmbeddings: withRow?.count ?? 0,
  };
}

export async function EmbeddingStatusBadge() {
  const status = await getEmbeddingStatus();

  if (status.mode === "real") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Sparkles className="h-3 w-3" />
        Búsqueda semántica (Gemini)
      </Badge>
    );
  }

  if (status.mode === "pseudo") {
    return (
      <Badge variant="outline" className="gap-1 border-amber-300 text-amber-800">
        <AlertTriangle className="h-3 w-3" />
        Embeddings aproximados — configura GEMINI_API_KEY y ejecuta npm run db:embed
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      Modo demo — búsqueda por texto
    </Badge>
  );
}
