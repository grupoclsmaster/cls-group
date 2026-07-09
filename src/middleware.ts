import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Verify that environment variables are present
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedRoutes = [
    "/dashboard",
    "/perfil",
    "/masterclasses",
    "/membros",
    "/oportunidades",
    "/projetos",
    "/recursos",
    "/calendario",
    "/admin"
  ];

  const pathname = request.nextUrl.pathname;

  const requiresAuth = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthPage = pathname === "/login" || pathname.startsWith("/login/") ||
                     pathname === "/cadastro" || pathname.startsWith("/cadastro/");

  // 1. Authentication Check
  if (!user) {
    if (requiresAuth) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // User is authenticated, check their status and role
  const { data: member } = await supabase
    .from("members")
    .select("status, member_type")
    .eq("id", user.id)
    .single();

  // 2. Active status check
  if (member && member.status !== "Ativo") {
    if (pathname !== "/sem-permissao") {
      const url = request.nextUrl.clone();
      url.pathname = "/sem-permissao";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 3. Admin-Only Route Check
  const isAdminRoute = pathname.startsWith("/admin") || 
                       pathname.startsWith("/oportunidades") || 
                       pathname.startsWith("/projetos");

  if (isAdminRoute && (!member || member.member_type !== "admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/sem-permissao";
    return NextResponse.redirect(url);
  }

  // 4. Redirect logged-in users away from auth pages
  if (isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (skip api routes to prevent middleware intercepting api calls or causing db query amplification on assets)
     */
    "/((?!_next/static|_next/image|api|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
