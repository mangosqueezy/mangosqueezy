"use server";

import { getErrorRedirect } from "@/lib/utils";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK!);

type CheckoutResponse = {
	errorRedirect?: string;
	sessionId?: string;
};

export async function checkoutWithStripe(
	stripeCustomerId: string,
	priceId: string,
): Promise<CheckoutResponse> {
	try {
		const params: Stripe.Checkout.SessionCreateParams = {
			allow_promotion_codes: true,
			billing_address_collection: "required",
			customer: stripeCustomerId,
			customer_update: {
				address: "auto",
			},
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: "subscription",
			cancel_url: "https://mangosqueezy.com/error",
			success_url: "https://mangosqueezy.com/campaigns",
		};

		// Create a checkout session in Stripe
		let session: Stripe.Checkout.Session;
		try {
			session = await stripe.checkout.sessions.create(params);
		} catch (err) {
			throw new Error("Unable to create checkout session.");
		}

		// Instead of returning a Response, just return the data or error.
		if (session) {
			return { sessionId: session.id };
		}

		throw new Error("Unable to create checkout session.");
	} catch (error) {
		if (error instanceof Error) {
			return {
				errorRedirect: getErrorRedirect(
					"https://mangosqueezy.com/error",
					error.message,
					"Please try again later or contact a system administrator.",
				),
			};
		}

		return {
			errorRedirect: getErrorRedirect(
				"https://mangosqueezy.com/error",
				"An unknown error occurred.",
				"Please try again later or contact a system administrator.",
			),
		};
	}
}

export async function createStripePortal(
	stripeCustomerId: string,
	priceId: string,
	stripeSubscriptionId: string,
	subscriptionItemId: string,
) {
	try {
		try {
			const { url } = await stripe.billingPortal.sessions.create({
				customer: stripeCustomerId,
				return_url: "https://mangosqueezy.com/campaigns",
				flow_data: {
					type: "subscription_update_confirm",
					subscription_update_confirm: {
						subscription: stripeSubscriptionId,
						items: [
							{
								id: subscriptionItemId,
								quantity: 1,
								price: priceId,
							},
						],
					},
				},
			});
			if (!url) {
				throw new Error("Could not create billing portal");
			}
			return url;
		} catch (err) {
			console.error(err);
			throw new Error("Could not create billing portal");
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error(error);
			return getErrorRedirect(
				"https://mangosqueezy.com/error",
				error.message,
				"Please try again later or contact a system administrator.",
			);
		}

		return getErrorRedirect(
			"https://mangosqueezy.com/error",
			"An unknown error occurred.",
			"Please try again later or contact a system administrator.",
		);
	}
}
