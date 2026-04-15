import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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
    default: "Goodspeed Bubble-to-Code Estimator",
    template: "%s | Goodspeed",
  },
  description:
    "Estimate the likely cost and timeline to rebuild a Bubble app in code with Goodspeed Studio.",
  openGraph: {
    title: "Goodspeed Bubble-to-Code Estimator",
    description:
      "A lead-gen estimator for founders and teams planning a Bubble-to-code rebuild.",
    type: "website",
    url: "https://goodspeed.studio/estimate",
    siteName: "Goodspeed",
  },
  twitter: {
    card: "summary_large_image",
    title: "Goodspeed Bubble-to-Code Estimator",
    description:
      "Estimate the likely cost and timeline to rebuild a Bubble app in code with Goodspeed Studio.",
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
