import { describe, expect, it } from "vitest";
import {
  checkPassword,
  firstPasswordProblem,
  isValidEmail,
  isValidName,
  normalizeEmail,
  PASSWORD_MIN_LENGTH,
} from "@/lib/validators";

describe("isValidEmail", () => {
  it("accepts normal addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.domain.org")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("missing@tld")).toBe(false);
    expect(isValidEmail("@no-local.com")).toBe(false);
    expect(isValidEmail("spaces in@email.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });

  it("rejects double dots and oversized input", () => {
    expect(isValidEmail("a..b@example.com")).toBe(false);
    expect(isValidEmail(`${"a".repeat(250)}@example.com`)).toBe(false);
  });
});

describe("isValidName", () => {
  it("accepts realistic names", () => {
    expect(isValidName("Alex Morgan")).toBe(true);
    expect(isValidName("Jo")).toBe(true);
  });

  it("rejects empty, too short and too long names", () => {
    expect(isValidName("")).toBe(false);
    expect(isValidName(" a ")).toBe(false);
    expect(isValidName("a".repeat(61))).toBe(false);
    expect(isValidName(null)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });
});

describe("password policy — portfolio friendly", () => {
  it("accepts short simple passwords (4 digits)", () => {
    expect(checkPassword("1234").valid).toBe(true);
    expect(checkPassword("abcd").valid).toBe(true);
    expect(checkPassword("nye-1").valid).toBe(true);
    expect(firstPasswordProblem("1234")).toBeNull();
  });

  it(`rejects passwords shorter than ${PASSWORD_MIN_LENGTH} characters`, () => {
    expect(checkPassword("123").valid).toBe(false);
    expect(checkPassword("").valid).toBe(false);
    expect(firstPasswordProblem("12")).toBe(
      `Password needs at least ${PASSWORD_MIN_LENGTH} characters.`,
    );
  });

  it("never rejects on missing complexity", () => {
    expect(checkPassword("password").valid).toBe(true); // no digits/symbols
    expect(checkPassword("ALLCAPS1").valid).toBe(true);
  });

  it("scores longer/complex passwords higher without blocking", () => {
    const simple = checkPassword("1234");
    const strong = checkPassword("Str0ng-Pass!2026");
    expect(simple.score).toBeLessThan(strong.score);
    expect(strong.label).toBe("Strong");
  });
});
