import { describe, expect, it, beforeEach } from "vitest";
import { currentUsage, incrementUsage } from "@/lib/usage";

describe("daily usage counter", () => {
  beforeEach(() => {
    // Use unique keys per test so the in-memory map doesn't leak between cases
  });

  it("counts up for the same key on the same day", () => {
    const key = `test-usage-${Math.random()}`;
    expect(currentUsage(key)).toBe(0);
    expect(incrementUsage(key)).toBe(1);
    expect(incrementUsage(key)).toBe(2);
    expect(currentUsage(key)).toBe(2);
  });

  it("keeps separate buckets per key", () => {
    const a = `bucket-a-${Math.random()}`;
    const b = `bucket-b-${Math.random()}`;
    incrementUsage(a);
    incrementUsage(a);
    incrementUsage(b);
    expect(currentUsage(a)).toBe(2);
    expect(currentUsage(b)).toBe(1);
  });
});
