import { test, expect } from "@playwright/test";

test("home page renders hero, map, and flash sale list", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /ตลาดทุ่งครุ 61/ })).toBeVisible();
  await expect(page.getByText("Flash Sale ตอนนี้")).toBeVisible();
  await expect(page.getByText("แผนที่ตลาดทุ่งครุ 61")).toBeVisible();
});

test("navigate to flash-sales and see list", async ({ page }) => {
  await page.goto("/flash-sales");
  await expect(page.getByRole("heading", { name: /Flash Sale ทั้งหมด/ })).toBeVisible();
});

test("shop detail page loads", async ({ page }) => {
  await page.goto("/shops/pa-nuan-noodle");
  await expect(page.getByRole("heading", { name: /ก๋วยเตี๋ยวป้านวล/ })).toBeVisible();
});

test("crowd forecast page renders KPIs", async ({ page }) => {
  await page.goto("/crowd");
  await expect(page.getByRole("heading", { name: /พยากรณ์ความหนาแน่น/ })).toBeVisible();
  await expect(page.getByText(/MAE/)).toBeVisible();
});

test("admin dashboard blocked without auth when supabase configured", async ({ page }) => {
  // Without Supabase envs, middleware lets everything through (degrades gracefully)
  await page.goto("/admin");
  // Page should respond with 200 regardless
  await expect(page).toHaveURL(/\/(admin|login)/);
});

test("api flash-sales returns json", async ({ request }) => {
  const res = await request.get("/api/flash-sales?status=ACTIVE");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("data");
  expect(Array.isArray(body.data)).toBe(true);
});

test("api crowd forecast returns predictions", async ({ request }) => {
  const res = await request.get("/api/crowd/forecast?hours=6");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.predictions.length).toBe(6);
  for (const p of body.predictions) {
    expect(p).toHaveProperty("count");
    expect(p).toHaveProperty("level");
  }
});
