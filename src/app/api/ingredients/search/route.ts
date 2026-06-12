import { NextRequest, NextResponse } from "next/server";
import { searchIngredients } from "@/lib/data/repository";
import { semanticSearchIngredients, generateEmbedding } from "@/lib/search/semantic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const mode = request.nextUrl.searchParams.get("mode") ?? "text";

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  if (mode === "semantic") {
    const embedding = await generateEmbedding(query);
    const results = await semanticSearchIngredients(query, embedding ?? undefined);
    return NextResponse.json(results);
  }

  const results = await searchIngredients(query);
  return NextResponse.json(results);
}
