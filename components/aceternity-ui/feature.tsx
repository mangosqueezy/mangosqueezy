import dashboard from "@/assets/dashboard.jpeg";
import { Button as MovingBorder } from "@/components/ui/moving-border";
import {
	BriefcaseIcon,
	ChartBarIcon,
	ClockIcon,
	GlobeAltIcon,
	MagnifyingGlassIcon,
	RocketLaunchIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";

const featuresList = [
	{
		name: "Automatic Affiliate Finding",
		description:
			"We find affiliates who are a great fit for your brand, so you don’t have to search for them yourself.",
		icon: MagnifyingGlassIcon,
	},
	{
		name: "Real-Time Performance Tracking",
		description:
			"See how your affiliates are performing and track results as they happen.",
		icon: ChartBarIcon,
	},
	{
		name: "Grow Quickly, Effortlessly",
		description:
			"Perfect for businesses of any size, helping you grow without a big marketing team.",
		icon: RocketLaunchIcon,
	},
	{
		name: "Targeted Matches for Your Brand",
		description:
			"Connect with affiliates who truly match your brand and audience.",
		icon: BriefcaseIcon,
	},
	{
		name: "Save Time with Simple Affiliate Management",
		description:
			"Spend less time on affiliate tasks and more time on your business—we handle the rest.",
		icon: ClockIcon,
	},
	{
		name: "Reach more customers",
		description: "Get more customers by using affiliate marketing.",
		icon: GlobeAltIcon,
	},
];

export default function Feature() {
	return (
		<div className="py-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl sm:text-center">
					<h2 className="text-2xl font-bold leading-7 dark:text-white">
						AFFILIATES
					</h2>
					<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
						{`Your affiliates are like helpful friends who can boost your business. With mangosqueezy, you can make as many affiliate links as you want and keep an eye on how well they're doing.`}
					</p>
				</div>
			</div>
			<div className="relative rounded-xl mx-auto max-w-7xl px-6 lg:px-8 mt-10">
				<MovingBorder
					borderRadius="1.75rem"
					className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 h-full w-full"
				>
					<Image
						src={dashboard}
						alt="App screenshot"
						className="rounded-[inherit] border object-contain shadow-lg dark:hidden"
						width={2432}
						height={1442}
					/>
				</MovingBorder>
			</div>
			<div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
				<dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
					{featuresList.map((feature) => (
						<div key={feature.name} className="relative pl-9">
							<dt className="inline font-semibold text-orange-600">
								<feature.icon
									className="absolute left-1 top-1 h-5 w-5 text-orange-600"
									aria-hidden="true"
								/>
								{feature.name}
							</dt>{" "}
							<dd className="inline text-gray-600">{feature.description}</dd>
						</div>
					))}
				</dl>
			</div>
		</div>
	);
}
