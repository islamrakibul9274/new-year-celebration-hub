import { describe, expect, it } from "vitest";
import {
  newsletterEmailHtml,
  passwordResetEmailHtml,
  ticketEmailHtml,
  vipWelcomeEmailHtml,
  welcomeEmailHtml,
} from "@/lib/mailer";

describe("email templates", () => {
  it("personalises the welcome email", () => {
    const html = welcomeEmailHtml("Alex");
    expect(html).toContain("Alex");
    expect(html).toContain("#ff3366");
    expect(html).not.toContain("undefined");
  });

  it("includes the ticket code in the RSVP email", () => {
    const html = ticketEmailHtml({
      guestName: "Sam",
      ticketCode: "NYE-2026-ABC12",
      passType: "vip_silver",
      guestsCount: 2,
    });
    expect(html).toContain("NYE-2026-ABC12");
    expect(html).toContain("Sam");
    expect(html).toContain("VIP_SILVER");
  });

  it("builds a reset link", () => {
    const html = passwordResetEmailHtml("Jo", "https://example.com/reset?token=abc");
    expect(html).toContain("https://example.com/reset?token=abc");
    expect(html).toContain("expires in 60 minutes");
  });

  it("mentions the advertised coupon in the newsletter email", () => {
    expect(newsletterEmailHtml()).toContain("FESTIVE15");
  });

  it("lists member perks in the VIP email", () => {
    const html = vipWelcomeEmailHtml("Kim", "Diamond Gala");
    expect(html).toContain("Diamond Gala");
    expect(html).toContain("Unlimited AI");
    expect(html).toContain("Verified member badge");
  });
});
