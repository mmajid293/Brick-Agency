import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Brick Agency | Brick Kiln ERP",
  description:
    "Smart Brick Agency — manage workers, production, inventory, finance and dispatch for your brick kiln business.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#B7410E",
  width: "device-width", 
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/logo.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-on-background antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
