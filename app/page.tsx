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
						AI Agent.
					</h1>
					<p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
						We help you find cold leads on YouTube, and Bluesky — warm them up,
						and build real partnerships.
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
					eyebrow="Chat"
					title="Chat with affiliates"
					description="Chat with your affiliates to build relationships, answer questions, and provide support. Keep all your affiliate communications organized in one place."
					graphic={
						<div className="h-80 bg-[url(/screenshots/chat.png)] bg-[left_0px_top_-80px] bg-no-repeat" />
					}
					fade={["bottom"]}
					className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
				/>
				<BentoCard
					eyebrow="Analysis"
					title="Analyze your affiliates"
					description="With our advanced data analytics, you'll know how your affiliates are performing and how to improve their performance."
					graphic={
						<div className="absolute inset-0 bg-[url(/screenshots/analytics.png)] bg-[left_-500px_bottom_-100px] bg-no-repeat" />
					}
					fade={["bottom"]}
					className="lg:col-span-3 lg:rounded-tr-4xl"
				/>
				<BentoCard
					eyebrow="Easy"
					title="Easy to add products"
					description="mangosqueezy is easy to add products for affiliates."
					graphic={
						<div className="absolute inset-0 bg-[url(/screenshots/products.png)] bg-no-repeat" />
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

function HowToUse() {
	return (
		<Container className="pb-24">
			<div
				className="relative overflow-hidden rounded-xl border-2 border-gray-300/50 p-8 shadow-sm ring-1 ring-gray-200/50 ring-offset-2 sm:p-12"
				style={{
					backgroundColor: "white",
					backgroundImage: `
						linear-gradient(rgba(251, 146, 60, 0.08) 1px, transparent 1px),
						linear-gradient(90deg, rgba(251, 146, 60, 0.08) 1px, transparent 1px)
					`,
					backgroundSize: "24px 24px",
				}}
			>
				{/* Content */}
				<div className="relative">
					<div className="flex items-center gap-3">
						<div className="h-8 w-1 rounded-full bg-gray-200" />
						<Heading as="h3" className="mt-2 max-w-3xl">
							How to use mangosqueezy
						</Heading>
					</div>

					<div className="mt-16 grid gap-12 lg:grid-cols-2">
						{/* Left Column - Steps */}
						<div className="relative space-y-12">
							{/* Vertical Line */}
							<div className="absolute left-[17px] top-0 h-full w-[2px] bg-gray-100" />

							<div className="group relative transform space-y-1 pl-12 transition-all duration-300 ease-in-out hover:translate-x-2">
								<div className="absolute -left-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white shadow-sm transition-colors group-hover:bg-gray-800">
									1
								</div>
								<h4 className="text-xl font-semibold text-gray-900">
									Create Account
								</h4>
								<p className="text-md text-gray-600">
									Sign up for a free account to get started with mangosqueezy.
								</p>
							</div>

							<div className="group relative transform space-y-1 pl-12 transition-all duration-300 ease-in-out hover:translate-x-2">
								<div className="absolute -left-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white shadow-sm transition-colors group-hover:bg-gray-800">
									2
								</div>
								<h4 className="text-xl font-semibold text-gray-900">
									Add Product
								</h4>
								<p className="text-md text-gray-600">
									Add the product that you want to promote with help of
									affiliates.
								</p>
							</div>

							<div className="group relative transform space-y-1 pl-12 transition-all duration-300 ease-in-out hover:translate-x-2">
								<div className="absolute -left-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white shadow-sm transition-colors group-hover:bg-gray-800">
									3
								</div>
								<h4 className="text-xl font-semibold text-gray-900">
									Create Job
								</h4>
								<p className="text-md text-gray-600">
									Select your product and specify the number of affiliates you
									want to partner with.
								</p>
							</div>
						</div>

						{/* Right Column - Video */}
						<div className="flex items-center justify-center">
							<div className="w-full overflow-hidden rounded-xl bg-gray-100">
								<div
									style={{
										position: "relative",
										paddingBottom: "56.25%",
										height: 0,
									}}
								>
									<iframe
										src="https://www.youtube.com/embed/skd1p-RsnRc"
										title="How to use mangosqueezy"
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											height: "100%",
											border: 0,
										}}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default function Home() {
	return (
		<div className="overflow-hidden">
			<Hero />
			<main>
				<div className="bg-gradient-to-b from-white from-50% to-gray-100 py-32">
					<HowToUse />
					<FeatureSection />
					<BentoSection />
				</div>
			</main>
			<Footer />
		</div>
	);
}
