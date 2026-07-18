import type { Metadata } from "next";
import { Space_Grotesk, Roboto_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

// IMPORTANT: replace this with your actual deployed URL before sharing the
// link anywhere (Discord, Twitter/X, etc.) — Open Graph images and URLs
// need to be absolute, not relative, to show up correctly in link
// previews.
const siteUrl = "https://split-billing-on-monad.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SplitBill On Monad",
  description:
    "Split a bill with friends and settle up directly on Monad. Open a tab, share the link, everyone pays their own line item.",
  openGraph: {
    title: "SplitBill On Monad",
    description:
      "Split a bill with friends and settle up directly on Monad. Open a tab, share the link, everyone pays their own line item.",
    url: siteUrl,
    siteName: "SplitBill On Monad",
    images: [
      {
        url: "/monad-logo.png",
        width: 512,
        height: 512,
        alt: "Monad logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SplitBill On Monad",
    description:
      "Split a bill with friends and settle up directly on Monad. Open a tab, share the link, everyone pays their own line item.",
    images: ["/monad-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body className="font-body">
        <Providers>
          <div className="min-h-screen bg-page text-onbg">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
