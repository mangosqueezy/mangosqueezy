"use client";
import Feature from "@/components/aceternity-ui/feature";
import { Footer } from "@/components/aceternity-ui/footer";
import { Navigation } from "@/components/aceternity-ui/header";
import {
	HeroHighlight,
	Highlight,
} from "@/components/aceternity-ui/hero-highlight";
import Pricing from "@/components/aceternity-ui/pricing";
import { HighlightHub } from "@/components/magicui/highlight-hub";
import Faq from "@/components/mango-ui/faq";
import { motion } from "framer-motion";

export default function Page() {
	return (
		<div className="flex flex-col h-fit mx-auto">
			<div className="flex flex-col w-full mx-auto max-w-7xl">
				<Navigation />
			</div>
			<div className="w-full h-full">
				<HeroHighlight>
					<motion.h1
						initial={{
							opacity: 0,
							y: 20,
						}}
						animate={{
							opacity: 1,
							y: [20, -5, 0],
						}}
						transition={{
							duration: 0.5,
							ease: [0.4, 0.0, 0.2, 1],
						}}
						className="text-3xl px-4 md:text-4xl lg:text-6xl font-bold text-neutral-700 dark:text-white max-w-7xl leading-relaxed lg:leading-snug text-center mx-auto "
					>
						Affiliate{" "}
						<Highlight className="text-black dark:text-white">
							marketing tool
						</Highlight>
						<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
							mangosqueezy helps SaaS companies find affiliates and measure
							their progress.
						</p>
					</motion.h1>
				</HeroHighlight>
			</div>

			<Feature />
			<HighlightHub />
			<Pricing />
			<Faq />
			<Footer />
		</div>
	);
}
