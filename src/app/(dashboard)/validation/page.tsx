import { AppHeader } from "@/components/layout/sidebar";
import { ValidationPageClient } from "@/components/validation/validation-page-client";
import { getFormulas } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";

interface PageProps {
  searchParams: Promise<{ formula?: string }>;
}

export default async function ValidationPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const formulas = await getFormulas(user.id);

  return (
    <div>
      <AppHeader title="Validador técnico" />
      <div className="p-6">
        <ValidationPageClient
          formulas={formulas.map((f) => ({ id: f.id, name: f.name }))}
          initialFormulaId={params.formula}
        />
      </div>
    </div>
  );
}
