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
	title: "Mango Squeezy App",
	description: "The open source affiliate tool.",
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
