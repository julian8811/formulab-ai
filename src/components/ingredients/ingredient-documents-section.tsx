"use client";

import { useRouter } from "next/navigation";
import { DocumentUpload } from "./document-upload";
import type { IngredientDocument } from "@/lib/data/ingredient-documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  ingredientId: string;
  documents: IngredientDocument[];
}

export function IngredientDocumentsSection({ ingredientId, documents }: Props) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentUpload
          ingredientId={ingredientId}
          documents={documents}
          onUploaded={() => router.refresh()}
        />
      </CardContent>
    </Card>
  );
}
