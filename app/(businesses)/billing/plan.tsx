"use client";
import { Button } from "@/components/mango-ui/button";
import { Container } from "@/components/mango-ui/container";
import { Subheading } from "@/components/mango-ui/text";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRICE_IDS } from "@/lib/stripe/config";
import { createStripePortal } from "@/lib/stripe/server";
import { TIERS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import type { PricePlan } from "@prisma/client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

function PricingCards({
	plan,
	stripeCustomerId,
	stripeSubscriptionId,
	subscriptionItemId,
	subscriptionStatus,
}: {
	plan: PricePlan | null | undefined;
	stripeCustomerId: string;
	stripeSubscriptionId: string;
	subscriptionItemId: string;
	subscriptionStatus: string;
}) {
	return (
		<div className="relative py-24">
			<Container className="relative">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{TIERS.map((tier, tierIndex) => (
						<PricingCard
							key={`tier-${tierIndex}-${tier.name}`}
							tier={tier}
							plan={plan}
							stripeCustomerId={stripeCustomerId}
							stripeSubscriptionId={stripeSubscriptionId}
							subscriptionItemId={subscriptionItemId}
							subscriptionStatus={subscriptionStatus}
						/>
					))}
				</div>
			</Container>
		</div>
	);
}

function PricingCard({
	stripeCustomerId,
	stripeSubscriptionId,
	subscriptionItemId,
	tier,
	plan,
	subscriptionStatus,
}: {
	stripeCustomerId: string;
	tier: (typeof TIERS)[number];
	plan: PricePlan | null | undefined;
	stripeSubscriptionId: string;
	subscriptionItemId: string;
	subscriptionStatus: string;
}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const updatePricePlanHandler = useCallback(async () => {
		try {
			setIsLoading(true);
			const priceId = PRICE_IDS[tier.slug as keyof typeof PRICE_IDS];

			const url = await createStripePortal(
				stripeCustomerId,
				priceId,
				stripeSubscriptionId,
				subscriptionItemId,
				"subscription_update_confirm",
			);
			router.push(url);
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}, [
		stripeCustomerId,
		router,
		tier.slug,
		stripeSubscriptionId,
		subscriptionItemId,
	]);

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
								plan === tier.slug && subscriptionStatus === "active"
									? "secondary"
									: "primary"
							}
							className={cn(
								plan === tier.slug && subscriptionStatus === "active"
									? "bg-gray-50 text-gray-950 cursor-not-allowed"
									: "",
							)}
							onClick={updatePricePlanHandler}
							disabled={plan === tier.slug && subscriptionStatus === "active"}
						>
							{isLoading ? (
								<Loader className="size-4 animate-spin" />
							) : plan === tier.slug && subscriptionStatus === "active" ? (
								"Current plan"
							) : (
								"Upgrade"
							)}
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

export default function Plan({
	plan,
	stripeCustomerId,
	stripeSubscriptionId,
	subscriptionItemId,
	subscriptionStatus,
}: {
	plan: PricePlan | null | undefined;
	stripeCustomerId: string;
	stripeSubscriptionId: string;
	subscriptionItemId: string;
	subscriptionStatus: string;
}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const cancelPricePlanHandler = useCallback(async () => {
		try {
			setIsLoading(true);
			const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];

			const url = await createStripePortal(
				stripeCustomerId,
				priceId,
				stripeSubscriptionId,
				subscriptionItemId,
				"subscription_cancel_confirm",
			);
			router.push(url);
		} catch (error) {
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}, [
		stripeCustomerId,
		router,
		plan,
		stripeSubscriptionId,
		subscriptionItemId,
	]);

	return (
		<main className="overflow-hidden">
			<div className="flex items-center px-6 lg:px-8 gap-5">
				<h1 className="text-2xl font-bold">Plan</h1>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="border-none"
							disabled={isLoading}
						>
							{isLoading ? (
								<Loader className="size-4 animate-spin" />
							) : (
								<Cog6ToothIcon className="size-5" />
							)}
							<span className="sr-only">Open plan settings</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							className="text-red-600"
							onClick={cancelPricePlanHandler}
						>
							Cancel subscription
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<p className="mt-2 text-sm/6 text-gray-950/75 px-6 lg:px-8">
				We work with Stripe for payment processing and never keep your payment
				information in our database.
			</p>
			<p className="mt-2 text-sm/6 text-gray-950/75 px-6 lg:px-8">
				Your subscription status is{" "}
				<span className="font-bold">{subscriptionStatus}</span>.
			</p>
			<PricingCards
				plan={plan}
				stripeCustomerId={stripeCustomerId}
				stripeSubscriptionId={stripeSubscriptionId}
				subscriptionItemId={subscriptionItemId}
				subscriptionStatus={subscriptionStatus}
			/>
		</main>
	);
}
