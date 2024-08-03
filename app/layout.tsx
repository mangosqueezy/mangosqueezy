import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { PHProvider } from "./providers";
import dynamic from "next/dynamic";
import "./tailwind.css";

const PostHogPageView = dynamic(() => import("./posthog-pageview"), {
  ssr: false,
});

import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mango Squeezy App",
  description: "The open source crypto affiliate tool.",
  twitter: {
    card: "summary_large_image",
    site: "@mangosqueezy",
    title: "Mango Squeezy App",
    description: "The open source crypto affiliate tool.",
    images: "https://mangosqueezy.com/mangosqueezy.png",
  },
  openGraph: {
    title: "Mango Squeezy App",
    description: "The open source crypto affiliate tool.",
    images: [
      {
        url: "https://mangosqueezy.com/mangosqueezy.png",
        width: 1200,
        height: 630,
        alt: "Mango Squeezy App",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <PHProvider>
        <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
          <PostHogPageView />
          {children}
        </body>
      </PHProvider>
    </html>
  );
}
