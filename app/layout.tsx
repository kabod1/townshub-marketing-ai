import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://townshub-app.vercel.app";

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
        url: "/logo.png",
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
    images: ["/logo.png"],
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
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
