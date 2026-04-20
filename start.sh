#!/usr/bin/env bash
# One-command bootstrap for ตลาดทุ่งครุ 61 (ThungKhru61).
#
#   ./start.sh        — start the Next.js dev server (Turbopack + HMR)
#   ./start.sh clean  — wipe the .next cache first, then start
#   ./start.sh prod   — production build + start (no HMR)
#
# Hot reload: Next.js dev (Turbopack) watches every file under app/, components/,
# lib/, proxy.ts, and tailwind.config.ts. Save a file and the browser refreshes
# automatically — nothing extra to enable.
#
# Port handling: any stale next-server still bound to PORT (default 3000) is
# killed before launch so we never silently fall through to 3001 and end up
# with two servers fighting over the same browser session.

set -Eeuo pipefail

cd "$(dirname "$0")"

# Pin Node 22 (LTS) for this project. Homebrew installs node@22 keg-only, so
# we prepend its bin dir to PATH here instead of relying on the user's shell
# profile. See .nvmrc for the canonical version.
if [[ -d "/opt/homebrew/opt/node@22/bin" ]]; then
  export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
fi

log()  { printf '\033[36m→\033[0m %s\n' "$*"; }
warn() { printf '\033[33m⚠\033[0m %s\n' "$*"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# Free a TCP port by SIGKILL'ing whatever is listening on it. Used so a stale
# next-server from a previous session doesn't push the new dev server onto
# port 3001 (which the user can't reach in their bookmark/browser tab).
# Silent no-op when the port is already free.
kill_stale_port() {
  local port="$1"
  command -v lsof >/dev/null || return 0
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    warn "Port $port held by PID(s): $pids — killing so we don't fall through to $((port + 1))."
    # shellcheck disable=SC2086  # we want word-splitting on the pid list
    kill -9 $pids 2>/dev/null || true
    sleep 0.3
  fi
}

# run_with_timeout SECS CMD... — portable bash timeout (macOS has no `timeout`).
# Returns 124 when the command didn't finish within SECS seconds.
run_with_timeout() {
  local secs="$1"; shift
  "$@" &
  local pid=$!
  local waited=0
  while kill -0 "$pid" 2>/dev/null; do
    if (( waited >= secs )); then
      kill -TERM "$pid" 2>/dev/null || true
      sleep 1
      kill -KILL "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
      return 124
    fi
    sleep 1
    waited=$((waited + 1))
  done
  wait "$pid"
}

MODE="${1:-dev}"

command -v node >/dev/null || die "Node.js is required. Install via nvm or https://nodejs.org"
command -v npm  >/dev/null || die "npm is required."

# Install deps only when the lockfile genuinely changed. We key off
# node_modules/.package-lock.json — npm's own install manifest that it rewrites
# after every successful install — so the heuristic works retroactively for any
# existing install and never re-runs npm when the tree is already in sync.
INSTALL_MARKER="node_modules/.package-lock.json"
if [[ ! -d "node_modules" || ! -f "$INSTALL_MARKER" || "package-lock.json" -nt "$INSTALL_MARKER" ]]; then
  log "Installing dependencies (npm install)…"
  # --ignore-scripts left OFF on purpose: some transitive deps (notably
  # caniuse-lite via browserslist) rely on their lifecycle hooks to finish
  # populating dist files. Skipping them leaves the install half-wired.
  npm install --no-audit --no-fund
fi

# Generate the Prisma client once per schema change — bounded by a 120s timeout
# so a stalled network fetch (Prisma downloads engine binaries) can never freeze
# the whole bootstrap. Set SKIP_PRISMA=1 to bypass entirely when @prisma/client
# was already built in a previous run.
if [[ -f "prisma/schema.prisma" && -z "${SKIP_PRISMA:-}" ]]; then
  PRISMA_MARKER="node_modules/.prisma/client/index.d.ts"
  if [[ ! -f "$PRISMA_MARKER" || "prisma/schema.prisma" -nt "$PRISMA_MARKER" ]]; then
    log "Generating Prisma client (120s max)…"
    if run_with_timeout 120 npx --yes prisma generate; then
      :
    elif [[ -f "$PRISMA_MARKER" ]]; then
      warn "prisma generate stalled — using the previously generated client."
    else
      warn "prisma generate failed and no cached client — app starts in mock-fallback mode (lib/env.ts)."
    fi
  fi
fi

if [[ ! -f ".env.local" && ! -f ".env" ]]; then
  warn "No .env.local or .env found — the app will start in mock-fallback mode (see lib/env.ts)."
fi

DEV_PORT="${PORT:-3000}"

# Turbopack's persistent cache is keyed on resolved module paths. Config-level
# changes (next.config.*, package.json) genuinely invalidate the cache; source
# files like proxy.ts are hot-reloaded by Turbopack itself — wiping .next on
# every source edit forces a 10–30s cold recompile and defeats the point of the
# cache. Keep the check tight: config + lockfile only.
is_next_cache_stale() {
  [[ -d ".next" ]] || return 1
  local cache_ref=".next"
  for f in next.config.mjs next.config.js next.config.ts package-lock.json; do
    [[ -f "$f" && "$f" -nt "$cache_ref" ]] && return 0
  done
  return 1
}

case "$MODE" in
  clean)
    log "Clearing .next cache…"
    rm -rf .next
    kill_stale_port "$DEV_PORT"
    log "Starting Next.js dev server on :$DEV_PORT (Turbopack + HMR)…"
    exec npm run dev
    ;;
  prod)
    log "Building production bundle…"
    npm run build
    kill_stale_port "$DEV_PORT"
    log "Starting production server on :$DEV_PORT…"
    exec npm run start
    ;;
  dev|"")
    if is_next_cache_stale; then
      warn "Detected config/middleware change newer than .next cache — clearing to avoid stale-chunk compile stalls."
      rm -rf .next
    fi
    kill_stale_port "$DEV_PORT"
    log "Starting Next.js dev server on :$DEV_PORT (Turbopack + HMR)…"
    log "First compile of a route ~5–10s; subsequent edits hot-reload in <1s."
    exec npm run dev
    ;;
  *)
    die "Unknown mode: $MODE. Use: ./start.sh [dev|clean|prod]"
    ;;
esac
