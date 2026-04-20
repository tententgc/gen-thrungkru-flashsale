#!/usr/bin/env node
// Pre-dev setup for `npm run dev` — runs automatically via the `predev` npm hook.
//
// Responsibilities (must be fast — target <500ms total):
//   1. Free port 3000 so Next.js doesn't fall through to 3001.
//   2. Wipe .next when next.config.* or package-lock.json is newer than the
//      cache (stale chunks cause ~10-30s compile stalls on first route).
//   3. Warn if neither .env.local nor .env exists (mock-fallback mode).
//
// Cross-platform: no bash, no lsof dependency on the hot path.
// On macOS/Linux uses `lsof`; on Windows uses `netstat`. Silent no-op when
// the tool isn't present — losing the port-kill is never fatal, next-dev
// just starts on 3001.

import { execSync } from "node:child_process";
import { existsSync, rmSync, statSync } from "node:fs";
import { platform } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 3000;
const REQUIRED_NODE_MAJOR = 20;
const REQUIRED_NODE_MINOR = 9;

const c = {
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const log = (msg) => console.log(`${c.cyan("→")} ${msg}`);
const warn = (msg) => console.log(`${c.yellow("⚠")} ${msg}`);

function killPort(port) {
  const isWin = platform() === "win32";
  try {
    if (isWin) {
      const out = execSync(`netstat -ano | findstr :${port}`, { stdio: ["ignore", "pipe", "ignore"] }).toString();
      const pids = [...new Set(out.split(/\r?\n/).map((l) => l.trim().split(/\s+/).pop()).filter((p) => /^\d+$/.test(p)))];
      if (pids.length === 0) return;
      warn(`Port ${port} in use by PID(s): ${pids.join(", ")} — killing.`);
      for (const pid of pids) {
        try { execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" }); } catch {}
      }
    } else {
      const out = execSync(`lsof -ti:${port}`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
      if (!out) return;
      const pids = out.split(/\s+/);
      warn(`Port ${port} in use by PID(s): ${pids.join(", ")} — killing.`);
      execSync(`kill -9 ${pids.join(" ")}`, { stdio: "ignore" });
    }
  } catch {
    // lsof/netstat returns non-zero when the port is already free — expected.
  }
}

function isNextCacheStale() {
  const nextDir = resolve(cwd, ".next");
  if (!existsSync(nextDir)) return false;
  const cacheMtime = statSync(nextDir).mtimeMs;
  const configs = ["next.config.mjs", "next.config.js", "next.config.ts", "package-lock.json"];
  for (const f of configs) {
    const p = resolve(cwd, f);
    if (existsSync(p) && statSync(p).mtimeMs > cacheMtime) return true;
  }
  return false;
}

function envWarning() {
  const hasEnv = existsSync(resolve(cwd, ".env.local")) || existsSync(resolve(cwd, ".env"));
  if (!hasEnv) {
    warn("No .env.local or .env found — the app will start in mock-fallback mode (see lib/env.ts).");
  }
}

function checkNodeVersion() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < REQUIRED_NODE_MAJOR || (major === REQUIRED_NODE_MAJOR && minor < REQUIRED_NODE_MINOR)) {
    warn(
      `Node ${process.versions.node} detected — project requires >=${REQUIRED_NODE_MAJOR}.${REQUIRED_NODE_MINOR} (22 LTS recommended). ` +
        `Install via fnm/nvm/volta or https://nodejs.org`,
    );
  }
}

checkNodeVersion();
killPort(PORT);

if (isNextCacheStale()) {
  warn("Detected config/lockfile change newer than .next cache — clearing to avoid stale-chunk compile stalls.");
  rmSync(resolve(cwd, ".next"), { recursive: true, force: true });
}

envWarning();

log(`Starting Next.js dev server on :${PORT} (Turbopack + HMR)…`);
log(c.dim(`First compile of a route ~5–10s; subsequent edits hot-reload in <1s.`));
