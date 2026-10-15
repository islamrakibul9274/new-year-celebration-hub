import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import ParticleBackground from "@/components/effects/ParticleBackground";
import SessionExpiredBanner from "@/components/auth/SessionExpiredBanner";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    default: "New Year Celebration 2026 | Ultimate Midnight Gala & Deals Hub",
    template: "%s | New Year Celebration Hub",
  },
  description:
    "Celebrate New Year 2026 with live countdown lounges, AI resolution coaching, exclusive 65% holiday discounts, and VIP midnight gala passes.",
  metadataBase: new URL("https://newyear-celebration-hub.netlify.app"),
  openGraph: {
    title: "New Year Celebration 2026 | Ultimate Midnight Gala & Deals Hub",
    description:
      "Live countdown lounges, AI resolutions, 65% holiday deals, and VIP midnight gala passes.",
    url: "https://newyear-celebration-hub.netlify.app",
    siteName: "New Year Celebration Hub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Year Celebration 2026 | Midnight Gala & Deals Hub",
    description: "Live countdown lounges, AI resolutions, and VIP midnight gala passes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-canvas text-ink relative selection:bg-primary selection:text-white">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <ParticleBackground />
              <SessionExpiredBanner />
              <Navbar />
              <CartDrawer />
              <main id="main-content" className="min-h-screen relative z-10">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
