"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServer, createSupabaseService } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import type { UserRole } from "@/lib/types";

const emailSchema = z.email({ message: "อีเมลไม่ถูกต้อง" });
const phoneSchema = z
  .string()
  .regex(/^0\d{8,9}$/, { message: "เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)" });
const passwordSchema = z.string().min(8, { message: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" });

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

async function ensureSupabase() {
  const supabase = await createSupabaseServer();
  if (!supabase) {
    throw new Error(
      "Supabase ยังไม่ถูกตั้งค่า — กรอก NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local",
    );
  }
  return supabase;
}

export async function signInWithPassword(formData: FormData): Promise<ActionResult> {
  try {
    const email = emailSchema.parse(formData.get("email"));
    const password = passwordSchema.parse(formData.get("password"));
    const supabase = await ensureSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ" };
  }
  redirect("/");
}

export async function signUpWithPassword(formData: FormData): Promise<ActionResult> {
  let redirectTo = "/";
  try {
    const email = emailSchema.parse(formData.get("email"));
    const password = passwordSchema.parse(formData.get("password"));
    const displayName = z
      .string()
      .min(2)
      .parse(formData.get("displayName") ?? "ผู้ใช้");
    const phone = formData.get("phone")
      ? phoneSchema.parse(formData.get("phone"))
      : undefined;
    const role = (formData.get("role") as UserRole) ?? "CUSTOMER";

    const supabase = await ensureSupabase();

    // Skip Supabase's confirmation-email flow — it hits the free-tier rate
    // limit quickly during demo and blocks sign-up. Use the service-role
    // admin API to create the user as pre-confirmed, then sign them in so
    // the session cookie is issued immediately. Falls back to the normal
    // signUp() path only if the service role isn't configured.
    const admin = createSupabaseService();
    let userId: string | null = null;
    if (admin) {
      const { data: created, error: adminErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { displayName, role },
      });
      if (adminErr) {
        const alreadyExists = /registered|exists|duplicate/i.test(adminErr.message);
        if (!alreadyExists) return { ok: false, error: adminErr.message };
        // Email already in use — treat as sign-in attempt below.
      } else {
        userId = created.user?.id ?? null;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { displayName, role } },
      });
      if (error) return { ok: false, error: error.message };
      userId = data.user?.id ?? null;
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInErr) return { ok: false, error: signInErr.message };

    if (userId && ready.db && prisma) {
      await prisma.user.upsert({
        where: { id: userId },
        update: { displayName, role, phone: phone ?? null },
        create: {
          id: userId,
          email,
          phone: phone ?? null,
          displayName,
          role,
        },
      });
    }

    redirectTo = role === "VENDOR" ? "/vendor/onboarding" : "/";
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ" };
  }
  redirect(redirectTo);
}

export async function requestPhoneOtp(formData: FormData): Promise<ActionResult> {
  try {
    const phone = phoneSchema.parse(formData.get("phone"));
    const supabase = await ensureSupabase();
    const e164 = phone.startsWith("0") ? `+66${phone.slice(1)}` : phone;
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "ส่งรหัส OTP แล้ว กรุณาเช็คข้อความ" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "ส่ง OTP ไม่สำเร็จ" };
  }
}

export async function verifyPhoneOtp(formData: FormData): Promise<ActionResult> {
  try {
    const phone = phoneSchema.parse(formData.get("phone"));
    const token = z.string().length(6).parse(formData.get("token"));
    const supabase = await ensureSupabase();
    const e164 = phone.startsWith("0") ? `+66${phone.slice(1)}` : phone;
    const { error } = await supabase.auth.verifyOtp({
      phone: e164,
      token,
      type: "sms",
    });
    if (error) return { ok: false, error: error.message };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "OTP ไม่ถูกต้อง" };
  }
  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServer();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
