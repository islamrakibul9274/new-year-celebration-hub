export interface PasswordCheck {
  valid: boolean;
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  requirements: { label: string; met: boolean }[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const EMAIL_MAX = 254;
const NAME_MIN = 2;
const NAME_MAX = 60;

/**
 * Portfolio-grade policy: short passwords are accepted (this is a demo
 * celebration platform, not a bank). 4+ characters is enough to register;
 * the strength meter is advisory only and never blocks sign-up.
 */
export const PASSWORD_MIN_LENGTH = 4;

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const value = email.trim();
  if (value.length === 0 || value.length > EMAIL_MAX) return false;
  if (value.includes("..")) return false;
  return EMAIL_RE.test(value);
}

export function isValidName(name: unknown): name is string {
  if (typeof name !== "string") return false;
  const value = name.trim();
  return value.length >= NAME_MIN && value.length <= NAME_MAX;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function checkPassword(password: unknown): PasswordCheck {
  const value = typeof password === "string" ? password : "";
  const requirements = [
    { label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: value.length >= PASSWORD_MIN_LENGTH },
    { label: "One uppercase & lowercase", met: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: "One number", met: /[0-9]/.test(value) },
    { label: "One symbol (!@#$…)", met: /[^A-Za-z0-9]/.test(value) },
  ];

  const valid = requirements[0].met;

  // Advisory score only — never blocks registration
  let score: PasswordCheck["score"] = 1;
  if (!valid) score = 0;
  else if (value.length < 6) score = 1;
  else if (value.length < 10) score = requirements.slice(1).filter((r) => r.met).length >= 1 ? 3 : 2;
  else score = requirements.slice(1).filter((r) => r.met).length >= 2 ? 4 : 3;

  const label = !valid
    ? "Too short"
    : score === 1
      ? "Simple (fine for a demo)"
      : score === 2
        ? "Fair"
        : score === 3
          ? "Good"
          : "Strong";

  return { valid, score, label, requirements };
}

export function firstPasswordProblem(password: unknown): string | null {
  const result = checkPassword(password);
  if (result.valid) return null;
  return `Password needs at least ${PASSWORD_MIN_LENGTH} characters.`;
}
