import { AppHeader } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ title, children, className }: PageShellProps) {
  return (
    <div className="flex min-h-full min-w-0 flex-col">
      <AppHeader title={title} />
      <div className={cn("page-content min-w-0 flex-1 space-y-6 p-4 sm:p-6", className)}>
        {children}
      </div>
    </div>
  );
}
