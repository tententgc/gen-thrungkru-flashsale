"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, ready } from "@/lib/env";

export function createSupabaseBrowser() {
  if (!ready.supabase) return null;
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
