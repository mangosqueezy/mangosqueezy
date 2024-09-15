import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter as FontSans } from "next/font/google";
import { PHProvider } from "./providers";
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
	title: "mangosqueezy affiliates tool",
	description: "The open source affiliate tool.",
	openGraph: {
		title: "mangosqueezy | Affiliates marketing tool",
		description:
			"A tool that takes care of all your affiliate marketing needs for your business.",
		url: "https://mangosqueezy.com",
		siteName: "mangosqueezy | Affiliates marketing tool",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "https://lkjqkobxmgqedqtidcws.supabase.co/storage/v1/object/public/mangosqueezy/opengraph-image.jpg",
				width: 800,
				height: 600,
			},
			{
				url: "https://lkjqkobxmgqedqtidcws.supabase.co/storage/v1/object/public/mangosqueezy/opengraph-image.jpg",
				width: 1800,
				height: 1600,
			},
		],
	},
	twitter: {
		title: "mangosqueezy | Affiliates marketing tool",
		description:
			"A tool that takes care of all your affiliate marketing needs for your business.",
		images: [
			{
				url: "https://lkjqkobxmgqedqtidcws.supabase.co/storage/v1/object/public/mangosqueezy/twitter-image.jpg",
				width: 800,
				height: 600,
			},
			{
				url: "https://lkjqkobxmgqedqtidcws.supabase.co/storage/v1/object/public/mangosqueezy/twitter-image.jpg",
				width: 1800,
				height: 1600,
			},
		],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
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
				<body
					className={cn(
						"min-h-screen bg-background font-sans antialiased",
						fontSans.variable,
					)}
				>
					<PostHogPageView />
					{children}
				</body>
			</PHProvider>
		</html>
	);
}
