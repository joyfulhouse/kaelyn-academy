import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, ThemeInitScript } from "@/components/theme";
import { SkipLink } from "@/components/a11y/skip-link";
import { LiveRegionProvider } from "@/components/a11y/live-region";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Kaelyn's Academy - AI-Powered K-12 Learning",
  description:
    "Personalized education platform with AI tutoring, adaptive learning, and progress tracking for K-12 students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kaelyn's Academy",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeInitScript />
        <ThemeProvider>
          <SessionProvider>
            <LiveRegionProvider>
              <SkipLink href="#main-content">Skip to main content</SkipLink>
              {children}
            </LiveRegionProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
