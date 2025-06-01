import { PRICE_IDS } from "@/lib/stripe/config";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK!);

export async function updateSession(request: NextRequest) {
	const response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});
	const cookieStore = await cookies();

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);

	const result = await supabase.auth.getUser();

	if (!result.data.user) {
		return NextResponse.redirect(new URL("/login", request.url), {
			headers: request.headers,
		});
	}

	const { data } = await supabase
		.from("Business")
		.select(
			"commission, price_plan, stripe_subscription_id, trial_ends_at, stripe_customer_id",
		)
		.eq("id", result.data.user?.id);

	const business = data?.[0];
	const hasNoStripeCustomer = !business?.stripe_customer_id;

	if (business && hasNoStripeCustomer) {
		// create a new subscription
		const customer = await stripe.customers.create({
			email: result.data.user?.email,
		});

		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [
				{
					price: PRICE_IDS.Starter,
				},
			],
			trial_period_days: 14,
		});

		await supabase
			.from("Business")
			.update({
				stripe_customer_id: customer.id,
				trial_ends_at: subscription.trial_end
					? new Date(subscription.trial_end * 1000)
					: null,
				stripe_subscription_id: subscription.id,
			})
			.eq("id", result.data.user?.id);
	}

	const subscription = await stripe.subscriptions.retrieve(
		data?.[0]?.stripe_subscription_id,
	);

	const pathname = new URL(request.url).pathname;
	if (
		subscription.status !== "active" &&
		subscription.status !== "trialing" &&
		pathname !== "/billing"
	) {
		return NextResponse.redirect(new URL("/billing", request.url), {
			headers: request.headers,
		});
	}

	if (data && data[0]?.commission <= 0 && pathname !== "/onboarding") {
		return NextResponse.redirect(new URL("/onboarding", request.url), {
			headers: request.headers,
		});
	}

	return response;
}
