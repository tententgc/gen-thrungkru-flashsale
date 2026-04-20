import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { BellIcon, FlashIcon, CrowdIcon, ChevronIcon } from "@/components/icons";
import { formatTimeTH } from "@/lib/utils";

export const metadata = { title: "การแจ้งเตือน" };
export const dynamic = "force-dynamic";

type NotificationView = {
  id: string;
  type: string;
  title: string;
  body: string;
  sentAt: Date;
  href: string;
  read: boolean;
};

function payloadUrl(payload: unknown): string | undefined {
  if (payload && typeof payload === "object" && "url" in payload) {
    const url = (payload as { url?: unknown }).url;
    if (typeof url === "string") return url;
  }
  return undefined;
}

async function listAndMarkRead(userId: string): Promise<NotificationView[]> {
  if (!ready.db || !prisma) return [];
  const rows = await prisma.notificationLog.findMany({
    where: { userId },
    orderBy: { sentAt: "desc" },
    take: 50,
  });
  // Snapshot the read state BEFORE marking so this render still shows the
  // "unread" highlight on items the user is seeing for the first time.
  const views = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    sentAt: n.sentAt,
    href: payloadUrl(n.payload) ?? "/notifications",
    read: Boolean(n.readAt),
  }));
  if (views.some((n) => !n.read)) {
    await prisma.notificationLog.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath("/", "layout");
  }
  return views;
}

async function markAllRead(userId: string): Promise<void> {
  "use server";
  if (!ready.db || !prisma) return;
  await prisma.notificationLog.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  // Bust the layout cache so the SiteHeader bell badge re-fetches and shows
  // the new unread count (0) on the next render.
  revalidatePath("/", "layout");
}

export default async function NotificationsPage() {
  const session = await getSessionUser();
  if (!session) redirect(`/login?next=/notifications`);

  const notifications = await listAndMarkRead(session.id);
  const unread = notifications.filter((n) => !n.read).length;
  const markAll = markAllRead.bind(null, session.id);

  return (
    <div className="container-page space-y-6 py-4 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-hero">การแจ้งเตือน</h1>
          <p className="text-sm text-muted">
            {unread > 0 ? `${unread} รายการยังไม่ได้อ่าน` : "อ่านครบทุกรายการแล้ว"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 ? (
            <form action={markAll}>
              <button type="submit" className="btn-outline">
                อ่านแล้วทั้งหมด
              </button>
            </form>
          ) : null}
          <Link href="/settings/notifications" className="btn-outline">
            ตั้งค่า
          </Link>
        </div>
      </header>

      {notifications.length === 0 ? (
        <div className="card p-6 text-center text-sm text-muted">
          ยังไม่มีการแจ้งเตือน — กด “ตั้งค่า” เพื่อเปิดรับ push notification
          หรือติดตามร้านค้าที่ชอบ
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                className={`card flex items-start gap-3 p-4 ${n.read ? "" : "border-l-4 border-l-primary"}`}
              >
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    n.type === "FLASH_SALE"
                      ? "bg-flash/15 text-flash"
                      : n.type === "CROWD_ALERT"
                        ? "bg-accent/15 text-accent"
                        : "bg-secondary/15 text-secondary-fg"
                  }`}
                >
                  {n.type === "FLASH_SALE" ? (
                    <FlashIcon className="h-5 w-5" />
                  ) : n.type === "CROWD_ALERT" ? (
                    <CrowdIcon className="h-5 w-5" />
                  ) : (
                    <BellIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">{n.title}</div>
                  <p className="text-xs text-muted line-clamp-2">{n.body}</p>
                  <div className="mt-1 text-[11px] text-muted">
                    {formatTimeTH(n.sentAt)} · {n.sentAt.toLocaleDateString("th-TH")}
                  </div>
                </div>
                <ChevronIcon className="h-4 w-4 text-muted self-center" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
