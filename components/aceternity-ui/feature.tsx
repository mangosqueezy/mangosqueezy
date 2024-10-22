import dashboard from "@/assets/dashboard.jpeg";
import { Button as MovingBorder } from "@/components/ui/moving-border";
import {
	BriefcaseIcon,
	ChartBarIcon,
	CurrencyDollarIcon,
	GlobeAltIcon,
	LinkIcon,
	RocketLaunchIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";

const featuresList = [
	{
		name: "Real time payment settlement",
		description:
			"Make payment settlements fast for your affiliates. You can easily make cross-border payments via crypto in a few seconds.",
		icon: CurrencyDollarIcon,
	},
	{
		name: "Build your audience quickly",
		description:
			"Grow your audience quickly with the help of affiliates. They can help you reach your money goals faster without needing extra tools or complicated setups.",
		icon: RocketLaunchIcon,
	},
	{
		name: "See affiliate data right away",
		description:
			"Get real-time info on how your affiliates are doing. Our all-in-one platform shows you what's working well and what's not, so you know where to focus",
		icon: ChartBarIcon,
	},
	{
		name: "Make endless referral links",
		description:
			"Make as many referral links as you want. Create simple codes and programs for affiliates to help you find the best way to grow your business together.",
		icon: LinkIcon,
	},
	{
		name: "Manage affiliates easily",
		description:
			"Keep an eye on your affiliates' progress. Tell them about their earnings and when they'll get paid. Take care of and build good relationships with your affiliates.",
		icon: BriefcaseIcon,
	},
	{
		name: "Reach more customers",
		description:
			"Get more customers by using affiliate marketing. This helps you make more money, get more people buying from you, and build lasting relationships with your partners' followers.",
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
							<dt className="inline font-semibold text-black dark:text-white">
								<feature.icon
									className="absolute left-1 top-1 h-5 w-5 text-gray-950 dark:text-white"
									aria-hidden="true"
								/>
								{feature.name}
							</dt>{" "}
							<dd className="inline text-gray-600 dark:text-gray-300">
								{feature.description}
							</dd>
						</div>
					))}
				</dl>
			</div>
		</div>
	);
}
