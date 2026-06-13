import { AuthForm } from "@/components/auth/auth-form";
import { BrandLogo } from "@/components/brand/logo";

export default function SignupPage() {
  return (
    <div className="hero-gradient flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <BrandLogo href="/" size="lg" showTagline />
      <AuthForm mode="signup" />
    </div>
  );
}
