import { getVendorById, getVendorByUserId } from "@/lib/data/vendors";
import { getSessionUser } from "@/lib/auth/session";
import { categoryMeta } from "@/lib/categories";

export const metadata = { title: "ข้อมูลร้าน" };

export default async function VendorProfilePage() {
  const user = await getSessionUser();
  const vendor = user
    ? (await getVendorByUserId(user.id)) ?? (await getVendorById("v-01"))
    : await getVendorById("v-01");
  if (!vendor) return null;
  const cat = categoryMeta(vendor.category);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-hero">ข้อมูลร้าน</h1>
        <p className="text-sm text-muted">รายละเอียดที่ลูกค้าจะเห็น</p>
      </header>

      <form className="space-y-4">
        <div className="card p-5 space-y-4">
          <Field label="ชื่อร้าน" defaultValue={vendor.shopName} />
          <Field label="คำอธิบาย" defaultValue={vendor.description} as="textarea" />
          <Field
            label="หมวดหมู่"
            defaultValue={`${cat.emoji} ${cat.label}`}
            disabled
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="เบอร์โทร" defaultValue={vendor.phone} />
            <Field label="LINE ID" defaultValue={vendor.lineId ?? ""} />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">ตำแหน่งในตลาด</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="เลขล็อก" defaultValue={vendor.boothNumber} />
            <Field label="Latitude" defaultValue={String(vendor.latitude)} />
            <Field label="Longitude" defaultValue={String(vendor.longitude)} />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">เวลาเปิด-ปิด</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="เปิด" defaultValue={vendor.openTime} type="time" />
            <Field label="ปิด" defaultValue={vendor.closeTime} type="time" />
          </div>
          <div>
            <span className="text-xs font-semibold">เปิดวันใดบ้าง</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
                <span
                  key={d}
                  className={`chip ${vendor.openDays.includes(d) ? "chip-active" : ""}`}
                >
                  {d.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn-outline">ยกเลิก</button>
          <button className="btn-primary">บันทึกการเปลี่ยนแปลง</button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  as = "input",
  type = "text",
  disabled,
}: {
  label: string;
  defaultValue: string;
  as?: "input" | "textarea";
  type?: string;
  disabled?: boolean;
}) {
  const className =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-border/30";
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold">{label}</span>
      {as === "textarea" ? (
        <textarea rows={3} defaultValue={defaultValue} className={className} disabled={disabled} />
      ) : (
        <input type={type} defaultValue={defaultValue} className={className} disabled={disabled} />
      )}
    </label>
  );
}
