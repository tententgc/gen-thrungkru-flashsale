import Link from "next/link";
import { activeFlashSales, vendorById } from "@/lib/mock-data";
import { BellIcon, FlashIcon, CrowdIcon, ChevronIcon } from "@/components/icons";
import { formatTimeTH } from "@/lib/utils";

export const metadata = { title: "การแจ้งเตือน" };

type Notification = {
  id: string;
  type: "flash_sale" | "crowd_alert" | "vendor_update";
  title: string;
  body: string;
  sentAt: string;
  href: string;
  read: boolean;
};

function buildNotifications(): Notification[] {
  const sales = activeFlashSales().slice(0, 3);
  const base: Notification[] = sales.map((s, i) => {
    const vendor = vendorById(s.vendorId);
    return {
      id: `n-fs-${s.id}`,
      type: "flash_sale",
      title: `⚡ ${vendor?.shopName ?? "ร้าน"} ปล่อย Flash Sale!`,
      body: s.title,
      sentAt: new Date(Date.now() - i * 900_000).toISOString(),
      href: `/flash-sales/${s.id}`,
      read: i > 1,
    };
  });
  return [
    ...base,
    {
      id: "n-crowd-1",
      type: "crowd_alert",
      title: "ตลาดเริ่มคนน้อยแล้ว",
      body: "ตอนนี้เหมาะไปทานข้าวแบบไม่ต้องรอคิว",
      sentAt: new Date(Date.now() - 45 * 60_000).toISOString(),
      href: "/crowd",
      read: true,
    },
    {
      id: "n-crowd-2",
      type: "crowd_alert",
      title: "พรุ่งนี้คาดว่าคนเยอะมาก",
      body: "แนะนำไปก่อน 17:00 หรือหลัง 20:30",
      sentAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      href: "/crowd",
      read: true,
    },
  ];
}

export default function NotificationsPage() {
  const notifications = buildNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="container-page space-y-6 py-4 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-hero">การแจ้งเตือน</h1>
          <p className="text-sm text-muted">
            {unread > 0 ? `${unread} รายการยังไม่ได้อ่าน` : "อ่านครบทุกรายการแล้ว"}
          </p>
        </div>
        <Link href="/settings/notifications" className="btn-outline">
          ตั้งค่าการแจ้งเตือน
        </Link>
      </header>

      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id}>
            <Link
              href={n.href}
              className={`card flex items-start gap-3 p-4 ${n.read ? "" : "border-l-4 border-l-primary"}`}
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  n.type === "flash_sale"
                    ? "bg-flash/15 text-flash"
                    : n.type === "crowd_alert"
                      ? "bg-accent/15 text-accent"
                      : "bg-secondary/15 text-secondary-fg"
                }`}
              >
                {n.type === "flash_sale" ? (
                  <FlashIcon className="h-5 w-5" />
                ) : n.type === "crowd_alert" ? (
                  <CrowdIcon className="h-5 w-5" />
                ) : (
                  <BellIcon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm">{n.title}</div>
                <p className="text-xs text-muted line-clamp-2">{n.body}</p>
                <div className="mt-1 text-[11px] text-muted">
                  {formatTimeTH(n.sentAt)} · {new Date(n.sentAt).toLocaleDateString("th-TH")}
                </div>
              </div>
              <ChevronIcon className="h-4 w-4 text-muted self-center" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
