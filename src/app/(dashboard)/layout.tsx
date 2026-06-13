import { AppSidebar } from "@/components/layout/sidebar";
import { requireAuth } from "@/lib/auth/guard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-[linear-gradient(180deg,var(--background)_0%,#eceef0_100%)]">
        {children}
      </main>
    </div>
  );
}
