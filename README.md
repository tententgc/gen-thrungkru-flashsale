# ตลาดทุ่งครุ 61 — ThungKhru61

> Market PWA — flash sales, interactive map, proximity alerts, and crowd forecasting for ตลาดทุ่งครุ 61.

This repository implements the product vision in [`sprintplan.md`](./sprintplan.md). Backend services
(Supabase / FastAPI / MLflow) described in the plan are represented with mocked data at this stage so
the full experience can be demoed end-to-end without any external credentials.

## Stack

- **Next.js 15** (App Router) · TypeScript · React 19
- **Tailwind CSS** · custom warm market palette · IBM Plex Sans Thai + JetBrains Mono
- **Mock data layer** mirroring the Prisma schema (vendors, products, flash sales, crowd forecast)
- **SVG-based map** and crowd heatmap (swap for Mapbox GL / Recharts in later sprints)

## Getting started

```bash
pnpm install   # or npm install
pnpm dev       # starts http://localhost:3000
pnpm build     # production build
pnpm typecheck # tsc --noEmit
```

Copy `.env.example` to `.env.local` if you want to override the demo config (all values are optional —
the mock data layer is self-contained).

## Routes

| Route                          | Role        | Description                                          |
| ------------------------------ | ----------- | ---------------------------------------------------- |
| `/`                            | customer    | Home — hero, flash sales, map, categories, forecast  |
| `/flash-sales`                 | customer    | Browse & filter Flash Sales                          |
| `/flash-sales/[id]`            | customer    | Flash Sale detail + items + countdown                |
| `/shops`                       | customer    | All vendors with filter/sort                         |
| `/shops/[slug]`                | customer    | Shop detail: menu, flash sales, navigate             |
| `/map`                         | customer    | Full-screen interactive market map                   |
| `/crowd`                       | customer    | Crowd forecast dashboard (line chart + heatmap)      |
| `/notifications`               | customer    | Notification center                                  |
| `/settings/notifications`      | customer    | Notification preferences (radius, quiet hours, etc.) |
| `/login`, `/register`          | public      | Auth pages (demo accounts shown inline)              |
| `/vendor/onboarding`           | vendor      | 3-step vendor onboarding wizard                      |
| `/vendor/dashboard`            | vendor      | KPI + smart scheduling + quick actions               |
| `/vendor/products`             | vendor      | Product list                                         |
| `/vendor/flash-sales`          | vendor      | Flash sale history                                   |
| `/vendor/flash-sales/new`      | vendor      | 4-step flash sale wizard with impact simulator       |
| `/vendor/insights`             | vendor      | Per-vendor crowd insights                            |
| `/vendor/profile`              | vendor      | Shop info editor                                     |
| `/admin`                       | admin       | System-wide KPIs, model health, pending approvals    |
| `/admin/vendors`               | admin       | Vendor moderation table                              |
| `/admin/events`                | admin       | Holiday + event calendar fed to the forecast model   |
| `/api/shops`                   | JSON        | Shop list (filter by category, radius, live sale)    |
| `/api/flash-sales`             | JSON        | Flash sales with vendor + product + distance         |
| `/api/crowd/forecast`          | JSON        | 1–168 hour forecast                                  |
| `/api/crowd/now`               | JSON        | Current busy level + next 3 hours                    |

## Sprint coverage

| Sprint | Plan focus                            | Status in this repo                          |
| ------ | ------------------------------------- | -------------------------------------------- |
| 0      | Foundation, DS, PWA                   | ✅ Scaffolded                                |
| 1      | Auth + role                           | ✅ Mock pages + OTP placeholders             |
| 2      | Vendor onboarding + shop mgmt         | ✅ 3-step wizard + profile                   |
| 3      | Products + flash sale wizard          | ✅ 4-step wizard + countdown                 |
| 4      | Interactive map                       | ✅ SVG map (ready to swap for Mapbox)        |
| 5      | Notifications + geofence              | ✅ Notification center + preferences         |
| 6      | Search + social                       | ✅ Header search + autocomplete              |
| 7      | Crowd forecasting                     | ✅ Heatmap + line chart + forecast API       |
| 8      | Admin + testing + launch              | ✅ Admin KPI + model health + event calendar |

Backend parts — Supabase schema, Prisma migrations, FastAPI forecast service, MLflow tracking — will
replace the mock layer sprint by sprint. The data shapes in `lib/types.ts` + `lib/mock-data.ts` are
the contract all real services should honor.

## Design system

- Primary palette: `#C84B31` · secondary `#FFB84D` · accent `#2D7D6E` · bg `#FAF7F2`
- Typography: IBM Plex Sans Thai (display + body), Inter (latin fallback), JetBrains Mono (prices)
- Button shapes: pill primary, rounded outline, ghost
- Radii: `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-full`
- Animations: pulse-flash (live sales), slide-up (popovers), shimmer (skeletons)

## License

Proprietary · © ตลาดทุ่งครุ 61
