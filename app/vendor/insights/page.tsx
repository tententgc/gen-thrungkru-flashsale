import { getForecast } from "@/lib/data/crowd";
import { CrowdHeatmap } from "@/components/crowd/crowd-heatmap";
import { CrowdLineChart } from "@/components/crowd/crowd-line-chart";
import { TrendingIcon } from "@/components/icons";
import { formatTimeTH } from "@/lib/utils";

export const metadata = { title: "Insights สำหรับร้านค้า" };

export default async function VendorInsightsPage() {
  const forecast = await getForecast(168);
  const today = forecast.slice(0, 24);
  const peakIdxToday = today.reduce(
    (best, p, i) => (p.count > today[best].count ? i : best),
    0,
  );
  const peakToday = today[peakIdxToday]?.count ?? 0;
  const peakTimeToday = today[peakIdxToday]?.time;
  const avgToday = Math.round(
    today.reduce((acc, p) => acc + p.count, 0) / Math.max(today.length, 1),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-hero">Insights ของร้าน</h1>
        <p className="text-sm text-muted">
          ข้อมูลเชิงลึกจากระบบพยากรณ์ + พฤติกรรมลูกค้า
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Kpi
          title="พีควันนี้"
          value={`${peakToday} คน`}
          caption={
            peakTimeToday ? `ประมาณ ${formatTimeTH(peakTimeToday)}` : "—"
          }
        />
        <Kpi title="ค่าเฉลี่ย/ชั่วโมง" value={`${avgToday} คน`} caption="ตลอด 24 ชม." />
        <Kpi
          title="Conversion flash sale"
          value="—"
          caption="ยังไม่มีข้อมูล (ต้องเปิด tracking)"
        />
      </section>

      <CrowdLineChart points={forecast.slice(0, 24)} />
      <CrowdHeatmap points={forecast} />

      <div className="card p-5 space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <TrendingIcon className="h-5 w-5 text-accent" />
          แนะนำสำหรับวันนี้
        </div>
        <ul className="text-sm space-y-2 text-muted">
          <li>• ปล่อย flash sale ช่วง 17:30–18:30 คาดถึงผู้เห็น ~{Math.round(peakToday * 2.6)} คน</li>
          <li>• เตรียมวัตถุดิบเพิ่มสำหรับช่วงพีค (เพิ่ม 20% จากเมื่อวาน)</li>
          <li>• ใช้ปุ่ม "รายงานความหนาแน่น" ตอน 19:00 เพื่อช่วย train model ให้แม่นขึ้น</li>
        </ul>
      </div>
    </div>
  );
}

function Kpi({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{title}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-muted">{caption}</div>
    </div>
  );
}
