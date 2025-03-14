"use server";

import { isRealTimePaymentsEnabled } from "@/config/flags";
import { getAffiliateBusinessInfoById } from "@/models/affiliate_business";
import { createOrder } from "@/models/orders";
import { payoutTask } from "@/trigger/payout-job";
import { redirect } from "next/navigation";

type PaymentPreference =
	| "FullCrypto"
	| "HalfCryptoHalfFiat"
	| "FullFiat"
	| undefined;

export async function createOrderAction(formData: FormData) {
	const email = formData.get("email") as string;
	const business_id = formData.get("business_id") as string;
	const product_id = formData.get("product_id") as string;
	const affiliate_id = formData.get("affiliate_id") as string;
	const amount = formData.get("amount") as string;
	const quantity = formData.get("quantity") as string;
	const customer_address = formData.get("customer_address") as string;
	const realTimePaymentsEnabled = await isRealTimePaymentsEnabled();

	try {
		await createOrder({
			email,
			business_id,
			product_id,
			affiliate_id,
			quantity: quantity ? Number(quantity) : 0,
			customer_address: customer_address || "",
		});

		const information = await getAffiliateBusinessInfoById(
			business_id,
			Number.parseInt(affiliate_id),
		);

		await payoutTask.trigger({
			affiliate_id: Number.parseInt(affiliate_id),
			business_id,
			svix_consumer_app_id: information?.business.svix_consumer_app_id!,
			commission: information?.business.commission as number,
			amount,
			business_wallet_address: information?.business.wallet_address as string,
			affiliate_wallet_address: information?.affiliate.wallet_address as string,
			business_email: information?.business.email as string,
			affiliate_email: information?.affiliate.email as string,
			product_id,
			email,
			payment_preference: information?.business
				.payment_preference satisfies PaymentPreference,
			realTimePaymentsEnabled: realTimePaymentsEnabled as boolean,
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
