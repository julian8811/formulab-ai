import { AppHeader } from "@/components/layout/sidebar";
import { ValidationPageClient } from "@/components/validation/validation-page-client";
import { getFormulas } from "@/lib/actions";
import { requireAuth } from "@/lib/auth/guard";
import { resolveProjectFilter } from "@/lib/auth/organizations";

interface PageProps {
  searchParams: Promise<{ formula?: string; project?: string }>;
}

export default async function ValidationPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const projectId = await resolveProjectFilter(user.id, params.project);
  const formulas = await getFormulas(user.id, projectId);

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
