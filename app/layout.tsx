import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://townshub-app.vercel.app").trim();

export const metadata: Metadata = {
  title: "TownsHub Marketing AI",
  description: "AI-powered content amplification platform - Generate and distribute content across 300+ platforms",
  metadataBase: new URL(APP_URL),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "TownsHub Marketing AI",
    description: "AI-powered content amplification platform - Generate and distribute content across 300+ platforms",
    url: APP_URL,
    siteName: "TownsHub",
    images: [
      {
        url: `${APP_URL}/logo.png`,
        width: 1000,
        height: 1000,
        alt: "TownsHub Marketing AI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TownsHub Marketing AI",
    description: "AI-powered content amplification platform - Generate and distribute content across 300+ platforms",
    images: [`${APP_URL}/logo.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* GA is loaded by CookieConsent only after analytics consent is granted */}
        <CookieConsent gaId={GA_ID} />
      </body>
    </html>
  );
}
