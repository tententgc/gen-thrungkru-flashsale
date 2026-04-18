import { PlusIcon } from "@/components/icons";

export const metadata = { title: "Event Calendar" };

const EVENTS = [
  { date: "2026-04-13", title: "สงกรานต์ 2026", note: "คนมากกว่าปกติ +50%", tag: "holiday" },
  { date: "2026-04-22", title: "KMUTT สอบปลายภาค", note: "หลังสอบ 17:00 คาดคนเยอะ", tag: "school" },
  { date: "2026-05-01", title: "วันแรงงาน", note: "ตลาดเปิดถึง 24:00", tag: "holiday" },
  { date: "2026-05-15", title: "ตลาดนัดพิเศษ", note: "คอนเสิร์ตหน้าตลาด 19:00", tag: "event" },
];

export default function AdminEventsPage() {
  return (
    <div className="container-page py-4 md:py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-hero">Event Calendar</h1>
          <p className="text-sm text-muted">
            เหตุการณ์พิเศษที่ป้อนให้ model ใช้เป็น feature (holiday, payday, exam, event)
          </p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="h-4 w-4" /> เพิ่ม event
        </button>
      </header>
      <ul className="space-y-2">
        {EVENTS.map((e) => (
          <li key={e.date + e.title} className="card flex items-center gap-3 p-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary-50 text-primary font-bold">
              <div className="text-[10px] uppercase">{new Date(e.date).toLocaleDateString("th-TH", { month: "short" })}</div>
              <div className="text-xl leading-none">{new Date(e.date).getDate()}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{e.title}</div>
              <div className="text-xs text-muted">{e.note}</div>
            </div>
            <span className="chip text-[11px]">{e.tag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
