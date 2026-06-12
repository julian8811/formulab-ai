import { Suspense } from "react";
import DocumentsPageClient from "./documents-client";

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando...</div>}>
      <DocumentsPageClient />
    </Suspense>
  );
}
