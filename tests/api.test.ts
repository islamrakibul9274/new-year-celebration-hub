import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { MongoClient } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const RUN = Date.now();
const EMAIL = `itest-${RUN}@example.com`;

let server: ChildProcess | undefined;
let mongo: MongoClient | undefined;

interface Jar {
  token?: string;
}

function cookieHeader(jar: Jar): string | undefined {
  return jar.token ? `auth_token=${jar.token}` : undefined;
}

async function api(path: string, options: RequestInit & { jar?: Jar } = {}) {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers["Content-Type"] = "application/json";
  if (options.jar) {
    const cookie = cookieHeader(options.jar);
    if (cookie) headers.Cookie = cookie;
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie && options.jar) {
    options.jar.token = setCookie.split(";")[0].replace("auth_token=", "");
  }
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status > 0) return;
    } catch {
      /* not up */
    }
    await new Promise((r) => setTimeout(r, 700));
  }
  throw new Error("integration server failed to start");
}

async function mongoUri(): Promise<string> {
  const env = fs.readFileSync(".env.local", "utf8");
  const match = env.match(/^MONGODB_URI=(.*)$/m);
  if (!match) throw new Error("MONGODB_URI missing from .env.local");
  return match[1];
}

beforeAll(async () => {
  // NODE_ENV=test (set by vitest) makes `next start` skip .env.local — force production
  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: ["ignore", fs.openSync("/tmp/itest-server.log", "w"), fs.openSync("/tmp/itest-server.log", "w")],
    env: { ...process.env, NODE_ENV: "production" },
  });
  await waitForServer();
  mongo = new MongoClient(await mongoUri());
  await mongo.connect();
}, 120_000);

afterAll(async () => {
  if (mongo) {
    await mongo.db().collection("users").deleteMany({ email: EMAIL });
    await mongo.db().collection("resolutions").deleteMany({ userEmail: EMAIL });
    await mongo.db().collection("rsvps").deleteMany({ guestEmail: EMAIL });
    await mongo.close();
  }
  if (server?.pid) {
    try {
      process.kill(server.pid, "SIGTERM");
    } catch {
      /* gone */
    }
  }
});

describe("auth API", () => {
  const jar: Jar = {};

  it("registers an account with a 4-digit password", async () => {
    const res = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "Integration Tester", email: EMAIL, password: "1234" }),
      jar,
    });
    expect(res.status).toBe(200);
    expect(jar.token).toBeTruthy();
  });

  it("rejects a duplicate registration", async () => {
    const res = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "Dup", email: EMAIL, password: "1234" }),
      jar,
    });
    expect(res.status).toBe(409);
  });

  it("rejects a short password and an invalid email", async () => {
    const short = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "X", email: `short-${RUN}@example.com`, password: "12" }),
      jar,
    });
    expect(short.status).toBe(400);

    const badEmail = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "X", email: "not-an-email", password: "1234" }),
      jar,
    });
    expect(badEmail.status).toBe(400);
  });

  it("signs in with the 4-digit password", async () => {
    const res = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: EMAIL, password: "1234" }),
      jar,
    });
    expect(res.status).toBe(200);
  });

  it("rejects a wrong password with a generic message", async () => {
    const res = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: EMAIL, password: "9999" }),
    });
    expect(res.status).toBe(401);
    expect((res.json as { error: string }).error).toMatch(/invalid email or password/i);
  });

  it("returns the session via /api/auth/me", async () => {
    const res = await api("/api/auth/me", { jar });
    expect(res.status).toBe(200);
    expect((res.json as { user: { email: string } }).user.email).toBe(EMAIL);
  });

  it("rate limits repeated login attempts", async () => {
    const codes: number[] = [];
    for (let i = 0; i < 10; i++) {
      const res = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: `ratelimit-${RUN}@example.com`, password: "wrong1" }),
      });
      codes.push(res.status);
    }
    expect(codes).toContain(429);
  });

  it("clears the session on logout", async () => {
    const logoutJar: Jar = { token: jar.token };
    const res = await api("/api/auth/logout", { method: "POST", jar: logoutJar });
    expect(res.status).toBe(200);
    const me = await api("/api/auth/me", { jar: logoutJar });
    expect((me.json as { user: unknown }).user).toBeNull();
  });
});

describe("membership benefits", () => {
  const jar: Jar = {};

  it("signs the test user back in", async () => {
    const res = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: EMAIL, password: "1234" }),
      jar,
    });
    expect(res.status).toBe(200);
  });

  it("caps AI generations at 3/day for free members", async () => {
    const codes: number[] = [];
    for (let i = 1; i <= 4; i++) {
      const res = await api("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: `integration test goal ${i}: read more books this year`,
          type: "resolution",
          category: "Career & Tech",
          authorName: "Integration",
        }),
        jar,
      });
      codes.push(res.status);
    }
    expect(codes.slice(0, 3)).toEqual([200, 200, 200]);
    expect(codes[3]).toBe(403);
  });

  it("upgrades to silver via 1-click activation", async () => {
    const res = await api("/api/user/upgrade-plan", {
      method: "POST",
      body: JSON.stringify({ planId: "silver" }),
      jar,
    });
    expect(res.status).toBe(200);
    expect((res.json as { plan: string }).plan).toBe("silver");
    expect(jar.token).toBeTruthy();

    const me = await api("/api/auth/me", { jar });
    expect((me.json as { user: { plan: string } }).user.plan).toBe("silver");
  });

  it("gives silver members unlimited AI generations", async () => {
    const codes: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const res = await api("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: `silver goal ${i}: ship a side project`,
          type: "resolution",
          category: "Career & Tech",
          authorName: "Integration",
        }),
        jar,
      });
      codes.push(res.status);
    }
    expect(codes).toEqual([200, 200, 200]);
  });

  it("downgrades an unentitled RSVP tier to the plan's best tier", async () => {
    const res = await api("/api/rsvp", {
      method: "POST",
      body: JSON.stringify({
        guestName: "Integration Tester",
        guestEmail: EMAIL,
        guestsCount: 2,
        passType: "diamond_all_access",
      }),
      jar,
    });
    expect(res.status).toBe(200);
    expect((res.json as { passType: string; downgraded: boolean }).passType).toBe("vip_silver");
    expect((res.json as { downgraded: boolean }).downgraded).toBe(true);
  });

  it("accepts the entitled silver tier", async () => {
    const res = await api("/api/rsvp", {
      method: "POST",
      body: JSON.stringify({
        guestName: "Integration Tester",
        guestEmail: EMAIL,
        guestsCount: 1,
        passType: "vip_silver",
      }),
      jar,
    });
    expect(res.status).toBe(200);
    expect((res.json as { passType: string }).passType).toBe("vip_silver");
  });
});

describe("orders and other APIs", () => {
  it("rejects an empty order", async () => {
    const res = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({ items: [] }),
    });
    expect(res.status).toBe(400);
  });

  it("creates an order with coupon math", async () => {
    const res = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        couponCode: "HOLIDAY50",
        items: [
          { id: 101, name: "Deluxe Party Hamper", price: 100, qty: 1, img: "/images/x.webp" },
        ],
      }),
    });
    expect(res.status).toBe(200);
    const body = res.json as { orderNumber: string; total: number };
    expect(body.orderNumber).toMatch(/^NYE-2026-/);
    expect(body.total).toBe(50);
  });

  it("requires auth for Stripe checkout verification", async () => {
    const res = await api("/api/stripe/verify", {
      method: "POST",
      body: JSON.stringify({ sessionId: "cs_test_integration" }),
    });
    expect(res.status).toBe(401);
  });

  it("validates newsletter sign-ups", async () => {
    const bad = await api("/api/newsletter", {
      method: "POST",
      body: JSON.stringify({ email: "nope" }),
    });
    expect(bad.status).toBe(400);
  });

  it("serves the public RSVP guest list", async () => {
    const res = await api("/api/rsvp");
    expect(res.status).toBe(200);
    expect((res.json as { totalCount: number }).totalCount).toBeGreaterThan(0);
  });
});
