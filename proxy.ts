import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env, ready } from "@/lib/env";

const VENDOR_PATH = /^\/vendor(\/|$)/;
const ADMIN_PATH = /^\/admin(\/|$)/;
const AUTH_PATH = /^\/(notifications|settings)(\/|$)/;

export async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const path = req.nextUrl.pathname;

  const needsAuth = VENDOR_PATH.test(path) || ADMIN_PATH.test(path) || AUTH_PATH.test(path);
  if (!needsAuth) return res;

  if (!ready.supabase) return res;

  // Fast path: no Supabase auth cookie at all — skip the client init and
  // redirect straight to login. Saves a full Supabase client bootstrap on
  // every unauthenticated visit to a protected route.
  const hasSbCookie = req.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!hasSbCookie) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

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

  // Verify the session against Supabase auth server. getSession() reads
  // cookies directly without verification (Supabase warns about this), so we
  // stick with getUser() even though it costs one network round trip — the
  // cookie short-circuit above already skips this for unauthenticated users.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  if (!user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    const redirect = NextResponse.redirect(loginUrl);
    for (const c of req.cookies.getAll()) {
      if (c.name.startsWith("sb-")) redirect.cookies.delete(c.name);
    }
    return redirect;
  }

  const role =
    (user.user_metadata as Record<string, unknown> | null)?.["role"] === "ADMIN"
      ? "ADMIN"
      : (user.user_metadata as Record<string, unknown> | null)?.["role"] === "VENDOR"
        ? "VENDOR"
        : "CUSTOMER";

  if (ADMIN_PATH.test(path) && role !== "ADMIN") {
    const home = req.nextUrl.clone();
    home.pathname = "/";
    home.searchParams.set("denied", "admin");
    return NextResponse.redirect(home);
  }
  if (VENDOR_PATH.test(path) && role === "CUSTOMER") {
    const home = req.nextUrl.clone();
    home.pathname = "/";
    home.searchParams.set("denied", "vendor");
    return NextResponse.redirect(home);
  }

  return res;
}

export const config = {
  matcher: [
    "/vendor/:path*",
    "/admin/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
