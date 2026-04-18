import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";

export async function UserMenu() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <Link href="/login" className="btn-primary hidden sm:inline-flex">
        เข้าสู่ระบบ
      </Link>
    );
  }

  return (
    <form action={signOut} className="hidden sm:flex items-center gap-2">
      <Link
        href={user.role === "VENDOR" ? "/vendor/dashboard" : user.role === "ADMIN" ? "/admin" : "/"}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 hover:bg-primary-50"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-fg text-xs font-bold">
          {user.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-semibold truncate max-w-[8rem]">
          {user.displayName}
        </span>
      </Link>
      <button type="submit" className="btn-ghost text-xs" aria-label="ออกจากระบบ">
        ออก
      </button>
    </form>
  );
}
