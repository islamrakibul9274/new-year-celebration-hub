import { resend } from "@/lib/resend";

const FROM = "New Year Celebration <onboarding@resend.dev>";

function shell(heading: string, bodyHtml: string, accent = "#ff3366"): string {
  return `
  <div style="background-color:#0b0d14;color:#f3f4f6;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:12px;">
    <h1 style="color:${accent};margin:0 0 16px;">${heading}</h1>
    ${bodyHtml}
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #272c3d;padding-top:16px;">
      New Year Celebration Hub · New Park Hotel, Beach Garden Florida
    </p>
  </div>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_dummy") return false;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("Email dispatch failed:", err);
    return false;
  }
}

export function welcomeEmailHtml(name: string): string {
  return shell(
    `Happy New Year, ${name}! 🎆`,
    `<p>Welcome to the official New Year Midnight Celebration &amp; Resolution Hub.</p>
     <p>Your account is ready. Reserve your midnight pass, generate AI resolutions, and join the live lounge.</p>`,
  );
}

export function ticketEmailHtml(input: {
  guestName: string;
  ticketCode: string;
  passType: string;
  guestsCount: number;
}): string {
  return shell(
    "You're on the Guest List! 🎟️",
    `<p>Hey ${input.guestName}, get ready for the most magical midnight celebration of the year!</p>
     <div style="background:rgba(255,51,102,0.1);border:1px dashed #ff3366;border-radius:8px;padding:20px;margin:24px 0;">
       <p style="margin:4px 0;"><strong>Ticket Code:</strong> <span style="font-family:monospace;font-size:18px;color:#fbbf24;">${input.ticketCode}</span></p>
       <p style="margin:4px 0;"><strong>Venue:</strong> New Park Hotel, Beach Garden Florida</p>
       <p style="margin:4px 0;"><strong>Date:</strong> 31 December Night (7:30 PM – 12:30 AM)</p>
       <p style="margin:4px 0;"><strong>Pass Type:</strong> ${input.passType.toUpperCase()}</p>
       <p style="margin:4px 0;"><strong>Guests:</strong> ${input.guestsCount}</p>
     </div>`,
  );
}

export function newsletterEmailHtml(): string {
  return shell(
    "Welcome to the Inner Circle! 🥂",
    `<p>You'll be the first to receive exclusive party invites, 65% OFF holiday vouchers, and secret New Year giveaways.</p>
     <p style="color:#ff3366;font-weight:bold;">Promo code for 15% EXTRA OFF: <span style="font-family:monospace;background:#272c3d;padding:4px 8px;border-radius:4px;">FESTIVE15</span></p>`,
    "#f59e0b",
  );
}

export function passwordResetEmailHtml(name: string, resetUrl: string): string {
  return shell(
    "Reset your password 🔐",
    `<p>Hi ${name || "celebrator"}, we received a request to reset your New Year Celebration Hub password.</p>
     <p style="margin:24px 0;">
       <a href="${resetUrl}" style="background:#ff3366;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;">Choose a new password</a>
     </p>
     <p style="color:#9ca3af;font-size:13px;">This link expires in 60 minutes. If you didn't request a reset, you can safely ignore this email.</p>`,
  );
}

export function vipWelcomeEmailHtml(name: string, planName: string): string {
  return shell(
    `Welcome to ${planName}! 👑`,
    `<p>Hi ${name || "celebrator"}, your <strong>${planName}</strong> pass is now active.</p>
     <ul style="color:#d1d5db;line-height:1.8;padding-left:18px;">
       <li>Verified member badge across the platform</li>
       <li>Unlimited AI resolutions &amp; greeting cards</li>
       <li>Priority VIP RSVP pass tiers</li>
       <li>15% extra coupon on holiday deals (code: <strong>FESTIVE15</strong>)</li>
     </ul>
     <p style="margin-top:16px;">Your VIP status is already visible in the navigation, your profile, and the live lounge.</p>`,
    "#f59e0b",
  );
}
