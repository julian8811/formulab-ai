import { AuthForm } from "@/components/auth/auth-form";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Sparkles className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">FormuLab AI</span>
      </Link>
      <AuthForm mode="login" />
    </div>
  );
}
