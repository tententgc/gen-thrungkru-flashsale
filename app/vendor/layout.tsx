import Link from "next/link";
import { redirect } from "next/navigation";
import { ChartIcon, FlashIcon, UserIcon, HomeIcon, PinIcon } from "@/components/icons";
import { getSessionUser } from "@/lib/auth/session";
import { getVendorByUserId } from "@/lib/data/vendors";
import { ready } from "@/lib/env";
import { VENDORS } from "@/lib/mock-data";

const ITEMS = [
  { href: "/vendor/dashboard", icon: HomeIcon, label: "ภาพรวม" },
  { href: "/vendor/products", icon: PinIcon, label: "สินค้า" },
  { href: "/vendor/flash-sales", icon: FlashIcon, label: "Flash Sale" },
  { href: "/vendor/insights", icon: ChartIcon, label: "Insights" },
  { href: "/vendor/profile", icon: UserIcon, label: "ข้อมูลร้าน" },
];

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/vendor/dashboard");
  if (user.role === "CUSTOMER") redirect("/?denied=vendor");

  let shopName = "ร้านของฉัน";
  let boothNumber = "";
  const vendor = ready.db ? await getVendorByUserId(user.id) : VENDORS[0];
  if (vendor) {
    shopName = vendor.shopName;
    boothNumber = vendor.boothNumber;
  } else {
    shopName = user.displayName;
  }
  const subtitle = boothNumber ? `${shopName} · ${boothNumber}` : shopName;

  return (
    <div className="container-page py-4 md:py-8 grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="hidden md:block">
        <div className="card p-3 sticky top-20">
          <div className="px-2 pb-3">
            <div className="text-[11px] uppercase tracking-wider text-muted">
              Vendor Portal
            </div>
            <div className="font-bold line-clamp-1" title={subtitle}>
              {subtitle}
            </div>
          </div>
          <nav>
            <ul className="space-y-1">
              {ITEMS.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-primary-50"
                  >
                    <i.icon className="h-4 w-4" />
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
