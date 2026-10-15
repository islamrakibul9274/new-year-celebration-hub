import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

const RUN = Date.now();
const PASSWORD = "1234";
const EMAIL = `e2e-${RUN}@example.com`;

/**
 * The API deliberately rate-limits registrations (5 / 15 min), so this suite
 * signs up exactly once and re-authenticates with the same account elsewhere.
 */
async function signUp(page: Page) {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Join Celebration" }).waitFor();
  await page.fill("#signup-name", "E2E Tester");
  await page.fill("#signup-email", EMAIL);
  await page.fill("#signup-password", PASSWORD);
  await page.getByRole("button", { name: "Join Celebration" }).click();
  await page.waitForURL("**/profile", { timeout: 30_000 });
}

async function login(page: Page) {
  await page.goto("/login");
  await page.fill("#login-email", EMAIL);
  await page.fill("#login-password", PASSWORD);
  const respPromise = page.waitForResponse((r) => r.url().includes("/api/auth/login"), { timeout: 15000 }).catch(() => null);
  await page.getByRole("button", { name: "Sign In to Celebration" }).click();
  const resp = await respPromise;
  console.log("[login] status:", resp?.status(), "url now:", page.url());
  if (!resp || resp.status() !== 200) {
    console.log("[login] body:", (await page.textContent("body")).slice(0, 300));
  }
  await page.waitForURL("**/profile", { timeout: 30_000 });
}

async function activateSilver(page: Page) {
  await page.goto("/pricing");
  const activate = page.getByRole("button", { name: "Instant 1-Click Activate (VIP Demo)" }).first();
  await activate.waitFor();
  await page.waitForFunction(
    () => !document.body.textContent?.includes("Checking your account..."),
    { timeout: 15_000 },
  );
  await activate.click();
  await expect(page.getByText(/VIP Member/)).toBeVisible({ timeout: 20_000 });
}

test.describe.configure({ mode: "serial" });

test.describe("authentication", () => {
  test("signs up with a 4-digit password and keeps the session across a reload", async ({ page }) => {
    await signUp(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("E2E Tester");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("E2E Tester");
  });

  test("rejects a wrong password with a clear message", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#login-email", EMAIL);
    await page.fill("#login-password", "definitely-wrong");
    await page.getByRole("button", { name: "Sign In to Celebration" }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("signs back in with the same 4-digit password", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("E2E Tester");
  });

  test("signs out and returns to the home page", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /Pass/ }).first().click();
    await page.getByRole("menuitem", { name: "Sign Out" }).click();
    await page.waitForURL("http://localhost:3200/", { timeout: 20_000 });
    await expect(page.getByRole("link", { name: "Sign In" }).first()).toBeVisible();
  });

  test("prompts unauthenticated visitors on protected pages", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Sign In to View Profile" })).toBeVisible();
  });
});

test.describe("membership benefits", () => {
  test("activating a VIP pass shows the verified badge and plan name", async ({ page }) => {
    await login(page);
    await expect(page.locator("main").getByLabel("Verified member")).toHaveCount(0);

    await activateSilver(page);

    await page.getByRole("button", { name: /Pass/ }).first().click();
    await expect(page.locator("header").getByLabel("Verified member")).toHaveCount(1);

    await page.goto("/profile");
    // badge appears in the navbar AND the profile header
    await expect(page.getByLabel("Verified member")).toHaveCount(2);
    await expect(page.locator("main").getByLabel("Verified member")).toHaveCount(1);
    await expect(page.getByText("Silver Celebration Member")).toBeVisible();
  });

  test("the events page unlocks the entitled pass tier", async ({ page }) => {
    await login(page);
    await activateSilver(page);

    await page.goto("/events");
    await expect(page.locator("#rsvp-pass option[value='vip_silver']")).toBeEnabled();
    await expect(page.locator("#rsvp-pass option[value='diamond_all_access']")).toBeDisabled();
  });
});

test.describe("navigation & responsive", () => {
  test("no horizontal overflow at 375px on the primary pages", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const route of ["/", "/deals", "/events", "/pricing", "/ai-resolutions", "/login"]) {
      await page.goto(route);
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `route ${route} overflows horizontally`).toBeLessThanOrEqual(0);
    }
  });

  test("mobile menu opens and navigates", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.getByRole("link", { name: "Deals & Gifts" }).click();
    await page.waitForURL("**/deals");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("65% OFF Deals");
  });
});

test.afterAll(async () => {
  const env = fs.readFileSync(".env.local", "utf8");
  const uri = env.match(/^MONGODB_URI=(.*)$/m)?.[1];
  if (!uri) return;
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  await db.collection("users").deleteMany({ email: EMAIL });
  await db.collection("resolutions").deleteMany({ userEmail: EMAIL });
  await db.collection("rsvps").deleteMany({ guestEmail: EMAIL });
  await client.close();
});
