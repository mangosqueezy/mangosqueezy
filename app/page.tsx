"use client";

import { BentoCard } from "@/components/mango-ui/bento-card";
import { Button } from "@/components/mango-ui/button";
import { Container } from "@/components/mango-ui/container";
import { Footer } from "@/components/mango-ui/footer";
import { Gradient } from "@/components/mango-ui/gradient";
import { LogoCluster } from "@/components/mango-ui/logo-cluster";
import { MapComponent } from "@/components/mango-ui/map";
import { Navbar } from "@/components/mango-ui/navbar";
import { Screenshot } from "@/components/mango-ui/screenshot";
import { Heading, Subheading } from "@/components/mango-ui/text";
import { useEffect, useState } from "react";
import { getUser } from "./(businesses)/actions";

function Hero() {
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUser();
			setUserId(user?.id as string);
		};

		fetchUser();
	}, []);

	return (
		<div className="relative">
			<Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-inset ring-black/5" />
			<Container className="relative">
				<Navbar userId={userId} />
				<div className="pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32">
					<h1 className="font-display text-balance text-6xl/[0.9] font-medium tracking-tight text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
						Get more sales.
					</h1>
					<p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
						We help B2B and B2C businesses by finding affiliates, creating
						links, and tracking results for you.
					</p>
					<div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
						<Button href={userId ? "/pipeline" : "/login"}>
							{userId ? "Pipeline" : "Get Started"}
						</Button>
						<Button variant="secondary" href="/pricing">
							See pricing
						</Button>
					</div>
				</div>
			</Container>
		</div>
	);
}

function FeatureSection() {
	return (
		<div className="overflow-hidden">
			<Container className="pb-24">
				<Heading as="h2" className="max-w-3xl">
					A snapshot of your AI affiliate finder.
				</Heading>
				<Screenshot
					width={1200}
					height={768}
					src="/screenshots/dashboard.jpeg"
					className="mt-16 h-[36rem] sm:h-auto sm:w-[76rem]"
				/>
			</Container>
		</div>
	);
}

function BentoSection() {
	return (
		<Container>
			<Subheading>Affiliate</Subheading>
			<Heading as="h3" className="mt-2 max-w-3xl">
				Know more about your affiliates.
			</Heading>

			<div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
				<BentoCard
					eyebrow="Insight"
					title="Get perfect clarity"
					description="mangosqueezy uses social engineering to build a detailed analytics picture of your affiliates. Know their conversion rate, engagement rate, and more."
					graphic={
						<div className="h-80 bg-[url(/screenshots/affiliate-dashboard.jpeg)] bg-[size:1000px_560px] bg-[left_-300px_top_-50px] bg-no-repeat" />
					}
					fade={["bottom"]}
					className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
				/>
				<BentoCard
					eyebrow="Analysis"
					title="Analyze your affiliates"
					description="With our advanced data analytics, you’ll know how your affiliates are performing and how to improve their performance."
					graphic={
						<div className="absolute inset-0 bg-[url(/screenshots/analytics.png)] bg-[size:900px_430px] bg-[left_-120px_top_-53px] bg-no-repeat" />
					}
					fade={["bottom"]}
					className="lg:col-span-3 lg:rounded-tr-4xl"
				/>
				<BentoCard
					eyebrow="Easy"
					title="Easy to add products"
					description="mangosqueezy is easy to add products for affiliates."
					graphic={
						<div className="absolute inset-0 bg-[url(/screenshots/products.png)] bg-[size:230px_400px] bg-[left_50px_top_-43px] bg-no-repeat" />
					}
					fade={["bottom"]}
					className="lg:col-span-2 lg:rounded-bl-4xl"
				/>
				<BentoCard
					eyebrow="Source"
					title="Get the furthest reach"
					description="mangosqueezy is a powerful tool that helps you find affiliates. It uses AI to find the best affiliates for your product."
					graphic={<LogoCluster />}
					className="lg:col-span-2"
				/>
				<BentoCard
					eyebrow="Limitless"
					title="Search globally"
					description="mangosqueezy searches for affiliates in the most unexpected places."
					graphic={<MapComponent />}
					className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
				/>
			</div>
		</Container>
	);
}

export default function Home() {
	return (
		<div className="overflow-hidden">
			<Hero />
			<main>
				{/* <Container className="mt-10">
					<LogoCloud />
				</Container> */}
				<div className="bg-gradient-to-b from-white from-50% to-gray-100 py-32">
					<FeatureSection />
					<BentoSection />
				</div>
			</main>
			{/* <Testimonials /> */}
			<Footer />
		</div>
	);
}
