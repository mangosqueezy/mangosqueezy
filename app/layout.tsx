import { cn } from "@/lib/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PHProvider } from "./providers";
import "./globals.css";

const PostHogPageView = dynamic(() => import("./posthog-pageview"), {
	ssr: true,
});

export const metadata: Metadata = {
	title: "mangosqueezy affiliates tool",
	description: "The open source affiliate tool.",
	openGraph: {
		title: "mangosqueezy | Affiliates marketing tool",
		description:
			"mangosqueezy helps companies find affiliates and measure their progress.",
		url: "https://mangosqueezy.com",
		siteName: "mangosqueezy | Affiliates marketing tool",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "https://lkjqkobxmgqedqtidcws.supabase.co/storage/v1/object/public/mangosqueezy/github.png",
				width: 800,
				height: 600,
			},
			{
				url: "https://lkjqkobxmgqedqtidcws.supabase.co/storage/v1/object/public/mangosqueezy/github.png",
				width: 1800,
				height: 1600,
			},
		],
	},
	twitter: {
		title: "mangosqueezy | Affiliates marketing tool",
		description:
			"mangosqueezy helps companies find affiliates and measure their progress.",
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
						"min-h-screen bg-background antialiased",
						`${GeistSans.variable} ${GeistMono.variable}`,
					)}
				>
					<script
						src="https://pub-de4924ae66c74c129209cb58768d12fb.r2.dev/script.js"
						data-api-host="/_proxy/squzy"
						data-domains='{"refer":"go.squzy.link"}'
						defer
					/>
					<PostHogPageView />
					{children}
				</body>
			</PHProvider>
		</html>
	);
}
