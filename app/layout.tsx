import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goodspeed.studio"),
  title: {
    default: "Goodspeed Estimators",
    template: "%s | Goodspeed",
  },
  description:
    "Interactive Goodspeed estimators for Bubble-to-code rebuilds and fixed-price website scopes.",
  openGraph: {
    title: "Goodspeed Estimators",
    description:
      "Lead-gen estimators for founders and teams planning a Bubble rebuild or a new website scope.",
    type: "website",
    url: "https://goodspeed.studio",
    siteName: "Goodspeed",
  },
  twitter: {
    card: "summary_large_image",
    title: "Goodspeed Estimators",
    description:
      "Estimate the likely scope for a Bubble rebuild or a new website with Goodspeed Studio.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
