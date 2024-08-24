"use server";

import { getAffiliateBusinessInfoById } from "@/models/affiliate_business";
import { createOrder } from "@/models/orders";
import { payoutTask } from "@/trigger/payout-job";
import { redirect } from "next/navigation";
import { Svix } from "svix";

const SVIX_API_KEY = process.env.SVIX_API_KEY;
const svix = new Svix(SVIX_API_KEY!);

export async function createOrderAction(formData: FormData) {
	const email = formData.get("email") as string;
	const business_id = formData.get("business_id") as string;
	const product_id = formData.get("product_id") as string;
	const affiliate_id = formData.get("affiliate_id") as string;
	const amount = formData.get("amount") as string;

	try {
		await createOrder({
			email,
			business_id,
			product_id,
			affiliate_id,
		});

		const information = await getAffiliateBusinessInfoById(
			business_id,
			Number.parseInt(affiliate_id),
		);

		await payoutTask.trigger({
			commission: information?.business.commission as number,
			amount,
			business_wallet_address: information?.business.wallet_address as string,
			affiliate_wallet_address: information?.affiliate.wallet_address as string,
			business_email: information?.business.email as string,
			affiliate_email: information?.affiliate.email as string,
		});

		await svix.message.create(information?.business.svix_consumer_app_id!, {
			eventType: "invoice.paid",
			eventId: "evt_Wqb1k73rXprtTm7Qdlr38G",
			payload: {
				type: "invoice.paid",
				product_id,
				status: "paid",
				email,
			},
		});
	} catch (err) {
		console.error(err);
	}

	return "success";
}

export async function navigate(data: FormData) {
	const url = data.get("url") as string;
	redirect(url);
}
