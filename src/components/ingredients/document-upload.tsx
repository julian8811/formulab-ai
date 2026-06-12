"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Trash2 } from "lucide-react";
import type { IngredientDocument } from "@/lib/data/ingredient-documents";
import type { DocumentType } from "@/types";

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "technical_sheet", label: "Ficha técnica" },
  { value: "sds", label: "SDS / FDS" },
  { value: "coa", label: "COA" },
  { value: "ifra", label: "IFRA" },
  { value: "allergen_declaration", label: "Declaración alérgenos" },
];

interface DocumentUploadProps {
  ingredientId: string;
  documents: IngredientDocument[];
  onUploaded?: () => void;
}

export function DocumentUpload({
  ingredientId,
  documents,
  onUploaded,
}: DocumentUploadProps) {
  const [docType, setDocType] = useState<DocumentType>("technical_sheet");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", docType);

    try {
      const res = await fetch(`/api/ingredients/${ingredientId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al subir");
      }
      toast.success("Documento subido");
      onUploaded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(docId: string) {
    try {
      const res = await fetch(`/api/ingredients/${ingredientId}/documents/${docId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Documento eliminado");
      onUploaded?.();
    } catch {
      toast.error("No se pudo eliminar el documento");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <Select
            value={docType}
            onValueChange={(v) => v && setDocType(v as DocumentType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            id={`upload-${ingredientId}`}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            type="button"
            onClick={() => document.getElementById(`upload-${ingredientId}`)?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Subiendo..." : "Subir documento"}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin documentos adjuntos</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{doc.fileName}</span>
                <span className="text-xs text-muted-foreground">
                  ({doc.documentType})
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
