import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env, ready } from "@/lib/env";

// Middleware is the auth gate — it only verifies "is this user logged in?".
// Role-based authorization (ADMIN vs VENDOR vs CUSTOMER) is enforced in the
// corresponding layout (app/admin/layout.tsx, app/vendor/layout.tsx) where
// we can read the authoritative role from Prisma.
const PROTECTED_PATH = /^\/(vendor|admin|notifications|settings)(\/|$)/;

export async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const path = req.nextUrl.pathname;

  if (!PROTECTED_PATH.test(path)) return res;

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

  // Role enforcement lives in the page/layout layer (see app/admin/layout.tsx
  // and app/vendor/layout.tsx) because it reads the authoritative role from
  // Prisma. Middleware intentionally does not check user_metadata.role — it
  // can drift from the DB (e.g. an admin promoted via SQL never has their
  // Supabase metadata updated) and was causing legit admins to be redirected.
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
