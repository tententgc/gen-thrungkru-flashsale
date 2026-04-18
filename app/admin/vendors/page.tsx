import { listVendors } from "@/lib/data/vendors";
import { categoryMeta } from "@/lib/categories";

export const metadata = { title: "จัดการร้านค้า" };

export default async function AdminVendorsPage() {
  const vendors = await listVendors();
  return (
    <div className="container-page py-4 md:py-8 space-y-6">
      <header>
        <h1 className="heading-hero">จัดการร้านค้า</h1>
        <p className="text-sm text-muted">ทั้งหมด {vendors.length} ร้าน</p>
      </header>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50/50 text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-3">ร้าน</th>
              <th className="px-3 py-3">หมวด</th>
              <th className="px-3 py-3">Booth</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Verified</th>
              <th className="px-3 py-3">Active</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vendors.map((v) => {
              const cat = categoryMeta(v.category);
              return (
                <tr key={v.id} className="hover:bg-primary-50/40">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{v.logoEmoji}</span>
                      <div>
                        <div className="font-semibold">{v.shopName}</div>
                        <div className="text-[11px] text-muted">{v.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted">{cat.emoji} {cat.label}</td>
                  <td className="px-3 py-3 font-mono">{v.boothNumber}</td>
                  <td className="px-3 py-3">{v.rating.toFixed(1)} ({v.reviewCount})</td>
                  <td className="px-3 py-3">
                    {v.isVerified ? (
                      <span className="chip chip-active text-[10px]">Verified</span>
                    ) : (
                      <span className="chip text-[10px]">Pending</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {v.isActive ? (
                      <span className="text-success font-semibold text-xs">Active</span>
                    ) : (
                      <span className="text-muted text-xs">Inactive</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button className="text-sm text-primary font-semibold">Manage</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
