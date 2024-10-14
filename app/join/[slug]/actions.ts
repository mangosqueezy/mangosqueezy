"use server";

import {
	createAffiliate,
	createAffiliateBusiness,
	getAffiliateByEmail,
} from "@/models/affiliates";
import { getBusinessBySlug } from "@/models/business";
import { socialMediaTask } from "@/trigger/social-media-task";

export async function createAffiliateAction(body: FormData) {
	const first_name = body.get("firstname") as string;
	const last_name = body.get("lastname") as string;
	const email = body.get("email") as string;
	const description = body.get("description") as string;
	const wallet_address = body.get("wallet") as string;
	const url = body.get("url") as string;
	const ytChannelId = body.get("ytChannelId") as string;
	const instagram = body.get("instagram") as string;
	const companySlug = body.get("company-slug") as string;

	const result = await getAffiliateByEmail(email);

	let message = "success";
	if (result?.id) {
		message = "exists";
	} else {
		try {
			const affiliatePromise = createAffiliate({
				first_name,
				last_name,
				description,
				social_media_profiles: { url, youtube: ytChannelId, instagram },
				wallet_address,
				email,
			});

			const businessPromise = getBusinessBySlug(companySlug);

			const [affiliateResult, businessResult] = await Promise.all([
				affiliatePromise,
				businessPromise,
			]);

			// add your own store business_id for eg - uuid from business table
			let business_id = process.env.MANGO_SQUEEZY_BUSINESS_ID!;
			if (businessResult) {
				business_id = businessResult.id;
			}

			if (affiliateResult && affiliateResult.length > 0) {
				await createAffiliateBusiness({
					affiliate_id: affiliateResult[0].id,
					business_id,
					product_id: 23,
				});

				await socialMediaTask.trigger({
					affiliatorId: affiliateResult[0].id,
					ytChannelHandle: ytChannelId,
					igChannelHandle: instagram,
				});
			}
		} catch (err) {
			message = "error";
		}
	}

	return message;
}
