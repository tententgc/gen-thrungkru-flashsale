import { generateWeeklyForecast, bestTimesOnDate } from "@/lib/mock-data";
import { CrowdHeatmap } from "@/components/crowd/crowd-heatmap";
import { CrowdLineChart } from "@/components/crowd/crowd-line-chart";
import { BusyBadge } from "@/components/crowd/busy-badge";
import { formatDateTH, formatTimeTH } from "@/lib/utils";
import { ChartIcon } from "@/components/icons";

export const metadata = { title: "พยากรณ์ความหนาแน่น" };

export default function CrowdPage() {
  const forecast = generateWeeklyForecast();
  const next24 = forecast.slice(0, 24);
  const now = forecast[0];
  const bestToday = bestTimesOnDate(forecast, new Date(), 3);
  const bestTomorrow = bestTimesOnDate(
    forecast,
    new Date(Date.now() + 86_400_000),
    3,
  );

  return (
    <div className="container-page space-y-6 py-4 md:py-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="heading-hero">พยากรณ์ความหนาแน่นของตลาด</h1>
          <p className="text-sm text-muted">
            อัปเดตทุก 15 นาที · Model v1.0 (LightGBM ensemble Prophet)
          </p>
        </div>
        <div className="hidden md:block text-xs text-muted">
          <div>MAE: 18.4 คน/ชม.</div>
          <div>MAPE: 21.3%</div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-4">
        <Kpi
          title="ตอนนี้"
          value={`${now.count} คน`}
          caption={<BusyBadge level={now.level} size="sm" />}
        />
        <Kpi
          title="ชั่วโมงถัดไป"
          value={`${forecast[1]?.count ?? 0} คน`}
          caption={<BusyBadge level={forecast[1]?.level ?? "MODERATE"} size="sm" />}
        />
        <Kpi
          title="พีคของวันนี้"
          value={`~${Math.max(...forecast.slice(0, 24).map((p) => p.count))} คน`}
          caption="เวลา 18:00–20:00"
        />
        <Kpi
          title="Check-in วันนี้"
          value="143"
          caption="QR Ground Truth"
        />
      </div>

      <section className="space-y-3">
        <CrowdLineChart points={next24} />
      </section>

      <section className="space-y-3">
        <CrowdHeatmap points={forecast} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <BestTimes title="เวลาที่ดีที่สุดวันนี้" date={new Date()} points={bestToday} />
        <BestTimes
          title="เวลาที่ดีที่สุดพรุ่งนี้"
          date={new Date(Date.now() + 86_400_000)}
          points={bestTomorrow}
        />
      </section>

      <section className="card p-5 text-sm space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <ChartIcon className="h-4 w-4 text-accent" /> ที่มาของข้อมูล
        </div>
        <ul className="list-disc list-inside text-muted space-y-1">
          <li><b>App-open + location</b> ภายในรัศมี 500m (น้ำหนัก 1.0)</li>
          <li><b>Geofence enter/exit</b> ขอบตลาด (น้ำหนัก 2.0)</li>
          <li><b>QR check-in</b> 5 จุดภายในตลาด — ground truth (น้ำหนัก 5.0)</li>
          <li><b>Vendor report</b> ปุ่ม "คนเยอะตอนนี้" (น้ำหนัก 3.0)</li>
          <li><b>Features เสริม</b> สภาพอากาศจาก OpenWeather, วันหยุด, วันสอบ KMUTT, จำนวน flash sale ที่ active</li>
        </ul>
        <p className="text-xs text-muted pt-2">
          หมายเหตุ: 2 สัปดาห์แรกหลัง launch accuracy จะต่ำ — model กำลังเรียนรู้จากข้อมูลจริง
        </p>
      </section>
    </div>
  );
}

function Kpi({
  title,
  value,
  caption,
}: {
  title: string;
  value: string;
  caption?: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{title}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-muted">{caption}</div>
    </div>
  );
}

function BestTimes({
  title,
  date,
  points,
}: {
  title: string;
  date: Date;
  points: ReturnType<typeof bestTimesOnDate>;
}) {
  return (
    <div className="card p-5">
      <h3 className="heading-section">{title}</h3>
      <p className="text-xs text-muted">{formatDateTH(date)}</p>
      <ul className="mt-3 space-y-2">
        {points.map((p) => (
          <li key={p.time} className="flex items-center justify-between rounded-xl bg-accent/10 px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold">
                {formatTimeTH(p.time)}
              </span>
              <BusyBadge level={p.level} />
            </div>
            <div className="text-sm text-muted">
              คาดว่า <span className="font-semibold text-ink">{p.count}</span> คน
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
