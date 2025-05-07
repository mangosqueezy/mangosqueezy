"use client";

import affiliates from "@/assets/affiliates.gif";
import instagram from "@/assets/instagram.gif";
import metrics from "@/assets/metrics.gif";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const FeatureSection = ({
	title,
	description,
	imageSrc,
	videoSrc,
	isReversed,
	bgColor,
	textColor,
}: {
	title: string;
	description: string;
	imageSrc?: string;
	videoSrc?: string;
	isReversed: boolean;
	bgColor: string;
	textColor: string;
}) => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true });
	const controls = useAnimation();

	useEffect(() => {
		if (isInView) {
			controls.start("visible");
		}
	}, [isInView, controls]);

	return (
		<div
			ref={ref}
			className={`flex flex-col md:flex-row ${isReversed ? "md:flex-row-reverse" : ""} items-stretch`}
		>
			<motion.div
				className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16"
				initial="hidden"
				animate={controls}
				variants={{
					hidden: { opacity: 0, y: 50 },
					visible: { opacity: 1, y: 0 },
				}}
				transition={{ duration: 1, ease: "easeOut" }}
			>
				<h3 className={`text-2xl sm:text-4xl font-bold mb-4 ${textColor}`}>
					{title}
				</h3>
				<p className={"text-lg text-gray-600"}>{description}</p>
			</motion.div>
			<motion.div
				className={`w-full md:w-1/2 ${bgColor}`}
				initial="hidden"
				animate={controls}
				variants={{
					hidden: { opacity: 0, scale: 0.95 },
					visible: { opacity: 1, scale: 1 },
				}}
				transition={{ duration: 1, ease: "easeOut" }}
			>
				<div className="relative w-full h-0 pb-[75%] md:pb-[100%]">
					{videoSrc ? (
						<video
							className="absolute inset-0 w-4/5 h-4/5 object-cover m-auto rounded-xl"
							autoPlay
							loop
							muted
							playsInline
						>
							<source src={videoSrc} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					) : (
						<img
							src={imageSrc}
							alt="Feature illustration"
							className="absolute inset-0 w-4/5 h-4/5 object-cover m-auto rounded-xl"
						/>
					)}
				</div>
			</motion.div>
		</div>
	);
};

export default function HowItWorks() {
	return (
		<div className="bg-linear-to-b from-white to-gray-50">
			<div>
				<h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900">
					How It Works
				</h2>
				<FeatureSection
					title="Pick a product to promote — that's it!"
					description="Choose any product you want to market. It's that simple to get started."
					imageSrc={affiliates.src}
					isReversed={false}
					bgColor="bg-blue-400"
					textColor="text-blue-800"
				/>
				<FeatureSection
					title="The app creates a video and posts it on Instagram."
					description="Our AI generates engaging content and automatically shares it on our Instagram for brand awareness."
					imageSrc={instagram.src}
					isReversed={true}
					bgColor="bg-yellow-400"
					textColor="text-yellow-800"
				/>
				<FeatureSection
					title="The app finds affiliates and onboards them for you."
					description="We identify potential affiliates and handle the entire onboarding process."
					videoSrc="https://lkjqkobxmgqedqtidcws.supabase.co/storage/v1/object/public/mangosqueezy/rag-chatbot.mp4"
					isReversed={false}
					bgColor="bg-green-400"
					textColor="text-green-800"
				/>
				<FeatureSection
					title="Measure the affiliates performance"
					description="Track and analyze the success of your affiliate marketing campaigns in real-time."
					imageSrc={metrics.src}
					isReversed={true}
					bgColor="bg-orange-400"
					textColor="text-orange-800"
				/>
			</div>
		</div>
	);
}
