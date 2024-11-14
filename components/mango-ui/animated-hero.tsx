import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AnimatedHeroV0() {
	const [isVideoLoaded, setIsVideoLoaded] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVideoLoaded(true), 1000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 to-white">
			{/* Animated background */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff2e_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#4338ca_70%,transparent_100%)]" />
				<div className="absolute inset-0">
					{[...Array(20)].map((_, i) => (
						<div
							key={`bubble-${i}-${Math.random()}`}
							className="absolute rounded-full bg-gradient-to-b from-orange-200 to-transparent opacity-30 animate-pulse"
							style={{
								width: `${Math.random() * 200 + 50}px`,
								height: `${Math.random() * 200 + 50}px`,
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`,
							}}
						/>
					))}
				</div>
			</div>

			{/* Content */}
			<div className="relative container mx-auto px-6 py-16 md:py-24 lg:px-8 lg:py-32 min-h-screen flex items-center justify-center">
				<div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center h-full">
					<div className="max-w-2xl">
						<h1 className="text-4xl font-bold tracking-normal text-gray-900 sm:text-6xl mb-6 animate-fade-in-up">
							Find and onboard affiliates automatically
						</h1>
						<p className="mt-6 text-md leading-8 text-gray-600 animate-fade-in-up animation-delay-200">
							We help B2B and B2C businesses by finding affiliates, creating
							links, and tracking results for you. Just pick a product to
							promote, and we handle everything, so you can focus on growing
							your business.
						</p>
						<div className="mt-10 flex items-center gap-x-6 animate-fade-in-up animation-delay-400">
							<Button className="bg-orange-600 text-white hover:bg-orange-700">
								<Link href="/login">Get started</Link>
							</Button>
						</div>
					</div>
					<div className="lg:mt-0 relative">
						<div className="relative aspect-video overflow-hidden rounded-xl shadow-2xl transition-opacity duration-1000 ease-in-out">
							{isVideoLoaded ? (
								<video
									className="w-full h-full object-cover"
									autoPlay
									loop
									muted
									playsInline
								>
									<source
										src="https://lkjqkobxmgqedqtidcws.supabase.co/storage/v1/object/public/mangosqueezy/Arc.mp4"
										type="video/mp4"
									/>
									Your browser does not support the video tag.
								</video>
							) : (
								<div className="absolute inset-0 bg-gray-200 animate-pulse" />
							)}
						</div>
						<div className="absolute -bottom-6 -left-6 -right-6 -top-6 rounded-xl bg-gradient-to-br from-orange-200 via-orange-200 to-yellow-200 blur-2xl opacity-30" />
					</div>
				</div>
			</div>
		</div>
	);
}
