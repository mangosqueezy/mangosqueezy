"use server";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK!);

export async function joinWaitListUser(body: FormData) {
	const email = body.get("email") as string;

	let message = "success";
	const result = await prisma.waitlist.findUnique({ where: { email } });

	if (result?.id) {
		message = "exists";
	} else {
		try {
			await prisma.waitlist.create({
				data: {
					email,
				},
			});
		} catch (err) {
			message = "error";
		}
	}

	return message;
}

export async function getSubscriptionData(subscriptionId: string) {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);

	const subscriptionItemId = subscription?.items.data[0].id;

	const data = {
		status: subscription.status,
		price_id: subscription.items.data[0].price.id,
		trial_end: subscription.trial_end,
		subscription_item_id: subscriptionItemId,
	};

	return data;
}
