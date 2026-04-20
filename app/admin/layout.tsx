import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/?denied=admin");

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="border-b border-border bg-surface">
        <div className="container-page py-2 flex items-center gap-3 text-xs">
          <span className="chip bg-accent/15 text-accent font-bold">ADMIN</span>
          <nav className="flex items-center gap-1">
            <Link href="/admin" className="btn-ghost text-xs">Dashboard</Link>
            <Link href="/admin/vendors" className="btn-ghost text-xs">Vendors</Link>
            <Link href="/admin/events" className="btn-ghost text-xs">Events</Link>
          </nav>
          <span className="ml-auto text-muted">{user.displayName}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
