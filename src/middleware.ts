import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/formulas",
  "/ingredients",
  "/validation",
  "/claims",
  "/stability",
  "/costs",
  "/regulatory",
  "/documents",
  "/ai",
  "/settings",
];

const PUBLIC_PATHS = ["/login", "/signup", "/auth"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/ai/status" || pathname === "/api/admin/setup") {
      return NextResponse.next();
    }
  }

  const { response, user } = await updateSession(request);

  const demoWithoutAuth =
    !process.env.DATABASE_URL &&
    process.env.DEMO_MODE !== "false" &&
    !isSupabaseConfigured();

  if (demoWithoutAuth || isPublicPath(pathname) || pathname === "/") {
    return response;
  }

  if (isProtectedPath(pathname) && isSupabaseConfigured() && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
