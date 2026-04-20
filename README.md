# ตลาดทุ่งครุ 61 — ThungKhru61

> Market PWA — flash sales, interactive map, proximity alerts, and crowd forecasting for ตลาดทุ่งครุ 61.

This repository implements the product vision in [`sprintplan.md`](./sprintplan.md). Backend services
(Supabase / FastAPI / MLflow) described in the plan are mocked where credentials aren't wired so the
full experience can be demoed end-to-end.

## Stack

- **Next.js 16** (App Router, Turbopack) · TypeScript · React 19
- **Tailwind CSS** · custom warm market palette · IBM Plex Sans Thai + JetBrains Mono
- **Prisma 6 + Supabase Postgres** (PostGIS, pg_trgm, pgcrypto)
- **Mock data layer** mirroring the Prisma schema (vendors, products, flash sales, crowd forecast)
- **SVG-based map** + Mapbox GL integration ready

## Quick start — `npm run dev`

```bash
# 1. Verify Node version (22 LTS recommended — see .nvmrc; minimum 20.9)
node --version               # must print v20.9 or newer (v22 LTS recommended)

# 2. Environment — copy the template and edit only if you need custom values
cp .env.example .env.local   # then open .env.local and fill in any overrides

# 3. Install dependencies (runs `prisma generate` automatically via postinstall)
npm install

# 4. Start the dev server — Turbopack + HMR on http://localhost:3000
npm run dev
```

### Switching Node versions (optional)

Pick whichever tool you already have; none are required if `node --version` is already 20.9+.

```bash
# nvm (https://github.com/nvm-sh/nvm) — requires nvm.sh sourced in your shell
#   If `nvm: command not found`, add this to ~/.zshrc or ~/.bashrc:
#     export NVM_DIR="$HOME/.nvm"
#     [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install && nvm use        # reads .nvmrc (22)

# fnm (https://github.com/Schniz/fnm) — faster, zero-config
fnm use --install-if-missing

# volta (https://volta.sh)
volta install node@22

# Homebrew
brew install node@22 && brew link --overwrite --force node@22
```

That's it. `npm run dev` automatically:

- Kills any stale process holding port 3000 (no accidental fallback to 3001).
- Clears `.next` cache when `next.config.*` or `package-lock.json` is newer (avoids stale-chunk stalls).
- Warns if `.env.local` / `.env` is missing (app falls back to mock mode).
- Launches `next dev --turbopack` — first route compile ~5–10s, subsequent edits hot-reload in <1s.

### First run on a fresh machine

```bash
git clone <repo>
cd gen-thrungkru-flashsale
node --version                # must be v20.9+ (see "Switching Node versions" above if not)
cp .env.example .env.local    # fill in Supabase / Mapbox / VAPID values
npm install                   # also runs prisma generate
npm run dev
```

Open http://localhost:3000.

### Troubleshooting

| Symptom                                     | Fix                                                      |
| ------------------------------------------- | -------------------------------------------------------- |
| `nm: error: use: No such file or directory` running `nvm use` | `nvm` is not sourced in this shell — zsh auto-corrects to Xcode's `nm`. Either source nvm (see "Switching Node versions") or use `fnm`/`volta`/`brew`. |
| `prisma generate` failed during install     | Set `DATABASE_URL` in `.env.local`, then `npm run db:generate` |
| Dev server hangs at "Compiling / ..."        | `rm -rf .next && npm run dev`                            |
| Port 3000 kept by another process           | `npm run dev` auto-kills it; use `PORT=3001 npm run dev` to change port |
| Missing types from Prisma                   | `npm run db:generate`                                    |

## Available scripts

| Command                   | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `npm run dev`             | Next.js dev server (Turbopack + HMR) on :3000                 |
| `npm run dev:webpack`     | Same as dev but with webpack (fallback if Turbopack misbehaves) |
| `npm run build`           | Production build                                              |
| `npm run start`           | Serve the production build                                    |
| `npm run lint`            | ESLint                                                        |
| `npm run typecheck`       | `tsc --noEmit`                                                |
| `npm run test:e2e`        | Playwright E2E                                                |
| `npm run db:generate`     | Regenerate Prisma client after `schema.prisma` changes        |
| `npm run db:migrate`      | Apply pending migrations (production-safe)                    |
| `npm run db:migrate:dev`  | Create + apply new migration in dev                           |
| `npm run db:seed`         | Seed the database from `prisma/seed.ts`                       |
| `npm run db:studio`       | Open Prisma Studio                                            |
| `npm run db:reset`        | Drop + re-migrate + seed (destructive, local only)            |

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
