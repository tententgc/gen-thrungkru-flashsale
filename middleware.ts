import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env, ready } from "@/lib/env";

const PROTECTED = [/^\/vendor(\/|$)/, /^\/admin(\/|$)/];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  // If Supabase isn't wired, let every request through so the mock app keeps working.
  if (!ready.supabase) return res;

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(items) {
        for (const { name, value, options } of items) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED.some((re) => re.test(req.nextUrl.pathname));
  if (isProtected && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return res;
}

export const config = {
  matcher: [
    // Skip static assets, _next, favicon, images, manifest, service worker
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js).*)",
  ],
};
