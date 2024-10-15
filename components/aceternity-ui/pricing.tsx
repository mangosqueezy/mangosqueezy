import Meteors from "@/components/magicui/meteors";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@heroicons/react/20/solid";
import { IconBrandYoutube } from "@tabler/icons-react";
import Link from "next/link";

const includedFeatures = [
	"Instantly pay the affiliate commissions",
	"No worries about chargebacks",
	"Instantly accept payments globally",
	"Easy global payouts through cross-border",
];

export default function Pricing() {
	return (
		<div className="py-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl sm:text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
						Simple no-tricks pricing
					</h2>
				</div>
				<div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 dark:ring-gray-500 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none bg-grid-zinc-50">
					<div className="p-8 sm:p-10 lg:flex-auto">
						<h3 className="text-3xl font-bold tracking-tight dark:text-white">
							Free while in beta
						</h3>
						<div className="mt-10 flex items-center gap-x-4">
							<h4 className="flex-none text-md font-bold leading-6 text-green-600">
								What’s included
							</h4>
							<div className="h-px flex-auto bg-gray-100" />
						</div>
						<ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 dark:text-white sm:grid-cols-2 sm:gap-6">
							{includedFeatures.map((feature) => (
								<li key={feature} className="flex gap-x-3">
									<CheckIcon
										className="h-6 w-5 flex-none text-green-600"
										aria-hidden="true"
									/>
									{feature}
								</li>
							))}
						</ul>
					</div>
					<div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
						<div className="rounded-2xl bg-white text-black py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
							<div className="relative mx-auto px-8 flex m-2 w-full flex-col items-center justify-center overflow-hidden">
								<Meteors number={30} />
								<span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
									Free
								</span>
								<p className="mt-6 flex items-baseline justify-center gap-x-2">
									<span className="text-5xl font-bold tracking-tight text-black">
										$0
									</span>
									<span className="text-sm font-semibold leading-6 tracking-wide text-black">
										/month
									</span>
								</p>
								<form
									className="mx-auto mt-10 flex max-w-md space-y-4 flex-col"
									action="/"
									method="POST"
								>
									<label htmlFor="email" className="sr-only">
										Email address
									</label>
									<input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										required
										className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-black/10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
										placeholder="Enter your email"
									/>
									<Button type="submit">Notify me</Button>
								</form>
								<p className="mt-6 text-xs leading-5 text-black">
									Free while in beta. There will also be a freemium plan for all
									our users.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
