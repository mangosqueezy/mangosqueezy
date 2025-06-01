"use client";
import { getUser } from "@/app/(businesses)/actions";
import { Button } from "@/components/mango-ui/button";
import { Container } from "@/components/mango-ui/container";
import { Footer } from "@/components/mango-ui/footer";
import { Gradient, GradientBackground } from "@/components/mango-ui/gradient";
import { Link } from "@/components/mango-ui/link";
import { Navbar } from "@/components/mango-ui/navbar";
import { Heading, Lead, Subheading } from "@/components/mango-ui/text";
import { TIERS, cn, getPlanFromPriceId } from "@/lib/utils";
import { useStore } from "@/store";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
	CheckIcon,
	ChevronUpDownIcon,
	MinusIcon,
} from "@heroicons/react/16/solid";
import type { PricePlan } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { getSubscriptionData } from "../actions";

function Header() {
	return (
		<Container className="mt-16">
			<Heading as="h1">Simple Pricing</Heading>
			<Lead className="mt-6 max-w-3xl">
				AI affiliate agent to find affiliates for your business. Sign up today
				and start growing your business smarter.
			</Lead>
		</Container>
	);
}

function PricingCards({
	plan,
	userId,
	subscriptionStatus,
}: {
	plan: PricePlan | null | undefined;
	userId: string | null | undefined;
	subscriptionStatus: string | null;
}) {
	return (
		<div className="relative py-24">
			<Gradient className="absolute inset-x-2 bottom-0 top-48 rounded-4xl ring-1 ring-inset ring-black/5" />
			<Container className="relative">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{TIERS.map((tier, tierIndex) => (
						<PricingCard
							key={`tier-${tierIndex}-${tier.name}`}
							tier={tier}
							plan={plan}
							userId={userId}
							subscriptionStatus={subscriptionStatus}
						/>
					))}
				</div>
			</Container>
		</div>
	);
}

function PricingCard({
	tier,
	plan,
	userId,
	subscriptionStatus,
}: {
	tier: (typeof TIERS)[number];
	plan: PricePlan | null | undefined;
	userId: string | null | undefined;
	subscriptionStatus: string | null;
}) {
	const setPricePlan = useStore((state) => state.setPricePlan);
	const router = useRouter();

	return (
		<div className="grid grid-cols-1 rounded-4xl shadow-[inset_0_0_2px_1px_#ffffff4d] ring-1 ring-black/5 max-lg:mx-auto max-lg:w-full max-lg:max-w-md">
			<div className="grid grid-cols-1 rounded-4xl p-2 shadow-md shadow-black/5">
				<div className="rounded-3xl bg-white p-10 pb-9 shadow-2xl ring-1 ring-black/5">
					<Subheading>{tier.name}</Subheading>
					<p className="mt-2 text-sm/6 text-gray-950/75">{tier.description}</p>
					<div className="mt-8 flex items-center gap-4">
						<div className="text-5xl font-medium text-gray-950">
							${tier.priceMonthly}
						</div>
						<div className="text-sm/5 text-gray-950/75">
							<p>USD</p>
							<p>per month</p>
						</div>
					</div>
					<div className="mt-8">
						<Button
							variant={
								!userId
									? "primary"
									: plan === tier.slug && subscriptionStatus === "active"
										? "secondary"
										: "primary"
							}
							className={cn(
								plan === tier.slug && subscriptionStatus === "active"
									? "cursor-not-allowed"
									: "",
							)}
							onClick={() => {
								setPricePlan(tier.slug);
								if (userId) {
									router.push("/billing");
								} else {
									router.push(tier.href);
								}
							}}
							disabled={
								!!userId &&
								plan === tier.slug &&
								subscriptionStatus === "active"
							}
						>
							{!userId
								? "Start 14 day free trial"
								: plan === tier.slug && subscriptionStatus === "active"
									? "Current plan"
									: "Upgrade"}
						</Button>
					</div>
					<div className="mt-8">
						<h3 className="text-sm/6 font-medium text-gray-950">
							Start selling with:
						</h3>
						<ul className="mt-3 space-y-3">
							{tier.highlights.map((props, featureIndex) => (
								<FeatureItem
									key={`feature-${featureIndex}-${props.description}`}
									{...props}
								/>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

function PricingTable({
	selectedTier,
}: {
	selectedTier: (typeof TIERS)[number];
}) {
	const setPricePlan = useStore((state) => state.setPricePlan);

	return (
		<Container className="py-24">
			<table className="w-full text-left">
				<caption className="sr-only">Pricing plan comparison</caption>
				<colgroup>
					<col className="w-3/5 sm:w-2/5" />
					<col
						data-selected={selectedTier === TIERS[0] ? true : undefined}
						className="w-2/5 data-selected:table-column max-sm:hidden sm:w-1/5"
					/>
					<col
						data-selected={selectedTier === TIERS[1] ? true : undefined}
						className="w-2/5 data-selected:table-column max-sm:hidden sm:w-1/5"
					/>
					<col
						data-selected={selectedTier === TIERS[2] ? true : undefined}
						className="w-2/5 data-selected:table-column max-sm:hidden sm:w-1/5"
					/>
				</colgroup>
				<thead>
					<tr className="max-sm:hidden">
						<td className="p-0" />
						{TIERS.map((tier) => (
							<th
								key={tier.slug}
								scope="col"
								data-selected={selectedTier === tier ? true : undefined}
								className="p-0 data-selected:table-cell max-sm:hidden"
							>
								<Subheading as="div">{tier.name}</Subheading>
							</th>
						))}
					</tr>
					<tr className="sm:hidden">
						<td className="p-0">
							<div className="relative inline-block">
								<Menu>
									<MenuButton className="flex items-center justify-between gap-2 font-medium">
										{selectedTier.name}
										<ChevronUpDownIcon className="size-4 fill-slate-900" />
									</MenuButton>
									<MenuItems
										anchor="bottom start"
										className="min-w-(--button-width) rounded-lg bg-white p-1 shadow-lg ring-1 ring-gray-200 [--anchor-gap:6px] [--anchor-offset:-4px] [--anchor-padding:10px]"
									>
										{TIERS.map((tier) => (
											<MenuItem key={tier.slug}>
												<Link
													scroll={false}
													href={`/pricing?tier=${tier.slug}`}
													data-selected={
														tier === selectedTier ? true : undefined
													}
													className="group flex items-center gap-2 rounded-md px-2 py-1 data-focus:bg-gray-200"
												>
													{tier.name}
													<CheckIcon className="hidden size-4 group-data-selected:block" />
												</Link>
											</MenuItem>
										))}
									</MenuItems>
								</Menu>
								<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
									<ChevronUpDownIcon className="size-4 fill-slate-900" />
								</div>
							</div>
						</td>
						<td colSpan={3} className="p-0 text-right">
							<Button variant="outline" href={selectedTier.href}>
								Get started
							</Button>
						</td>
					</tr>
					<tr className="max-sm:hidden">
						<th className="p-0" scope="row">
							<span className="sr-only">Get started</span>
						</th>
						{TIERS.map((tier) => (
							<td
								key={tier.slug}
								data-selected={selectedTier === tier ? true : undefined}
								className="px-0 pb-0 pt-4 data-selected:table-cell max-sm:hidden"
							>
								<Button
									onClick={() => {
										setPricePlan(tier.slug);
									}}
									variant="outline"
									href={tier.href}
								>
									Get started
								</Button>
							</td>
						))}
					</tr>
				</thead>
				{[...new Set(TIERS[0].features.map(({ section }) => section))].map(
					(section) => (
						<tbody key={section} className="group">
							<tr>
								<th
									scope="colgroup"
									colSpan={4}
									className="px-0 pb-0 pt-10 group-first-of-type:pt-5"
								>
									<div className="-mx-4 rounded-lg bg-gray-50 px-4 py-3 text-sm/6 font-semibold">
										{section}
									</div>
								</th>
							</tr>
							{TIERS[0].features
								.filter((feature) => feature.section === section)
								.map(({ name }) => (
									<tr
										key={name}
										className="border-b border-gray-100 last:border-none"
									>
										<th
											scope="row"
											className="px-0 py-4 text-sm/6 font-normal text-gray-600"
										>
											{name}
										</th>
										{TIERS.map((tier) => {
											const value = tier.features.find(
												(feature) =>
													feature.section === section && feature.name === name,
											)?.value;

											return (
												<td
													key={tier.slug}
													data-selected={
														selectedTier === tier ? true : undefined
													}
													className="p-4 data-selected:table-cell max-sm:hidden"
												>
													{value === true ? (
														<>
															<CheckIcon className="size-4 fill-green-600" />
															<span className="sr-only">
																Included in {tier.name}
															</span>
														</>
													) : value === false || value === undefined ? (
														<>
															<MinusIcon className="size-4 fill-gray-400" />
															<span className="sr-only">
																Not included in {tier.name}
															</span>
														</>
													) : (
														<div className="text-sm/6">{value}</div>
													)}
												</td>
											);
										})}
									</tr>
								))}
						</tbody>
					),
				)}
			</table>
		</Container>
	);
}

function FeatureItem({
	description,
	disabled = false,
}: {
	description: string;
	disabled?: boolean;
}) {
	return (
		<li
			data-disabled={disabled ? true : undefined}
			className="flex items-start gap-4 text-sm/6 text-gray-950/75 data-disabled:text-gray-950/25"
		>
			<span className="inline-flex h-6 items-center">
				<PlusIcon className="size-[0.9375rem] shrink-0 fill-gray-950/25" />
			</span>
			{disabled && <span className="sr-only">Not included:</span>}
			{description}
		</li>
	);
}

function PlusIcon(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg viewBox="0 0 15 15" aria-hidden="true" {...props}>
			<path clipRule="evenodd" d="M8 0H7v7H0v1h7v7h1V8h7V7H8V0z" />
		</svg>
	);
}

function Testimonial() {
	return (
		<div className="mx-2 my-24 rounded-4xl bg-gray-900 bg-[url(/dot-texture.svg)] pb-24 pt-72 lg:pt-36">
			<Container>
				<div className="grid grid-cols-1 lg:grid-cols-[384px_1fr_1fr]">
					<div className="-mt-96 lg:-mt-52">
						<div className="-m-2 rounded-4xl bg-white/15 shadow-[inset_0_0_2px_1px_#ffffff4d] ring-1 ring-black/5 max-lg:mx-auto max-lg:max-w-xs">
							<div className="rounded-4xl p-2 shadow-md shadow-black/5">
								<div className="overflow-hidden rounded-3xl shadow-2xl outline outline-1 -outline-offset-1 outline-black/10">
									<Image
										alt=""
										src="/testimonials/tina-yards.jpg"
										className="aspect-3/4 w-full object-cover"
										width={384}
										height={512}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="flex max-lg:mt-16 lg:col-span-2 lg:px-16">
						<figure className="mx-auto flex max-w-xl flex-col gap-16 max-lg:text-center">
							<blockquote>
								<p className="relative text-3xl tracking-tight text-white before:absolute before:-translate-x-full before:content-['\\201C'] after:absolute after:content-['\\201D'] lg:text-4xl">
									Thanks to mangosqueezy, we&apos;re finding new leads that we
									never would have found with legal methods.
								</p>
							</blockquote>
							<figcaption className="mt-auto">
								<p className="text-sm/6 font-medium text-white">Tina Yards</p>
								<p className="text-sm/6 font-medium">
									<span className="bg-linear-to-r from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] bg-clip-text text-transparent">
										VP of Sales, Protocol
									</span>
								</p>
							</figcaption>
						</figure>
					</div>
				</div>
			</Container>
		</div>
	);
}

function FrequentlyAskedQuestions() {
	return (
		<Container className="mt-8">
			<section id="faqs" className="scroll-mt-8">
				<Subheading className="text-center">
					Frequently asked questions
				</Subheading>
				<Heading as="div" className="mt-2 text-center">
					Your questions answered.
				</Heading>
				<div className="mx-auto mb-32 mt-16 max-w-xl space-y-12">
					<dl>
						<dt className="text-sm font-semibold">
							Does mangosqueezy work for every kind of company?
						</dt>
						<dd className="mt-4 text-sm/6 text-gray-600">
							Yes, mangosqueezy works for every kind of company. Whether you are
							a small startup or a large enterprise, mangosqueezy can help you
							to setup, manage & grow your affiliate program.
						</dd>
					</dl>
					<dl>
						<dt className="text-sm font-semibold">
							Does mangosqueezy offer a Free plan?
						</dt>
						<dd className="mt-4 text-sm/6 text-gray-600">
							Yes, we offer a free plan. You can start with our free plan and
							upgrade to a paid plan when you are ready.
						</dd>
					</dl>
					<dl>
						<dt className="text-sm font-semibold">
							What is SaaS Affiliate Marketing?
						</dt>
						<dd className="mt-4 text-sm/6 text-gray-600">
							With Affiliate Marketing you are asking other people to do the
							marketing for you. When they deliver you paid clients (pay per
							performance) they will receive a commission. As SaaS means
							recurring subscriptions, it also means recurring commissions for
							the Affiliates. Making it a true win-win for both of them. No high
							upfront costs for SaaS & high potential earnings for affiliates.
						</dd>
					</dl>
					<dl>
						<dt className="text-sm font-semibold">
							Does mangosqueezy help me to find new affiliates?
						</dt>
						<dd className="mt-4 text-sm/6 text-gray-600">
							Yes, we have a network of B2B and B2C SaaS affiliates that are
							looking to promote your product.
						</dd>
					</dl>
					<dl>
						<dt className="text-sm font-semibold">
							How does mangosqueezy work?
						</dt>
						<dd className="mt-4 text-sm/6 text-gray-600">
							mangosqueezy is a SaaS platform that helps you to setup, manage &
							grow an affiliate program. You can create your own affiliate
							program, invite affiliates to join and track their performance.
						</dd>
					</dl>
				</div>
			</section>
		</Container>
	);
}

export default function Pricing() {
	const [userId, setUserId] = useState<string | null>(null);
	const [plan, setPlan] = useState<PricePlan | null | undefined>(null);
	const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
		null,
	);
	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUser();
			setUserId(user?.id as string);

			if (user?.stripe_subscription_id) {
				const subscription = await getSubscriptionData(
					user?.stripe_subscription_id as string,
				);
				const plan = getPlanFromPriceId(subscription.price_id);
				setPlan(plan);
				setSubscriptionStatus(subscription.status);
			}
		};

		fetchUser();
	}, []);

	return (
		<main className="overflow-hidden">
			<GradientBackground />
			<Container>
				<Navbar userId={userId} />
			</Container>
			<Header />
			<PricingCards
				plan={plan}
				userId={userId}
				subscriptionStatus={subscriptionStatus}
			/>
			{/* <PricingTable selectedTier={tiers[0]} /> */}
			{/* <Testimonial /> */}
			<FrequentlyAskedQuestions />
			<Footer />
		</main>
	);
}
