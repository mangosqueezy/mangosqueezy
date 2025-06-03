"use server";

import AffiliateEmailTemplate from "@/components/mango-ui/affiliate-email-template";
import { getAffiliateBusinessInfoByProductId } from "@/models/affiliate_business";
import {
	createAffiliate,
	createAffiliateBusiness,
	getAffiliateByEmail,
} from "@/models/affiliates";
import { Resend } from "resend";

const defaultSocialMediaProfiles = {
	url: "",
	youtube: "",
	instagram: "",
};

const SQUZY_API_KEY = process.env.SQUZY_API_KEY;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function checkAndCreateAffiliate(formData: FormData) {
	const first_name = formData.get("first_name") as string;
	const last_name = formData.get("last_name") as string;
	const email = formData.get("email") as string;
	const business_id = formData.get("business_id") as string;
	const product_id = formData.get("product_id") as string;
	const pipeline_id = formData.get("pipeline_id") as string;

	try {
		const affiliateInformation = await getAffiliateByEmail(email);

		if (affiliateInformation) {
			const affiliateBusinessInformation =
				await getAffiliateBusinessInfoByProductId(
					business_id,
					affiliateInformation.id,
					Number(product_id),
				);

			const isAffiliateAlreadyPartner =
				affiliateBusinessInformation?.affiliate.email === email &&
				affiliateBusinessInformation?.product_id === Number(product_id);

			if (isAffiliateAlreadyPartner) {
				return "You are already a partner for this product with this business";
			}

			const affiliateLink = `https://www.mangosqueezy.com/buy/${affiliateInformation.id}/${product_id}`;
			const options = {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${SQUZY_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					url: affiliateLink,
				}),
			};
			const response = await fetch(
				"https://api.squzy.link/links/upsert",
				options,
			);
			const squzyResponse = await response.json();

			const affiliate_link = squzyResponse.shortLink;
			const affiliate_link_key = squzyResponse.id;

			await createAffiliateBusiness({
				business_id,
				affiliate_id: Number(affiliateInformation.id),
				product_id: Number(product_id),
				pipeline_id: pipeline_id ? Number(pipeline_id) : null,
				affiliate_link: affiliate_link,
				affiliate_link_key: affiliate_link_key,
			});

			await resend.emails.send({
				from: "mangosqueezy <amit@tapasom.com>",
				to: [email],
				replyTo: "amit@tapasom.com",
				subject:
					"Thank you for promoting our products! Here's your affiliate link.",
				react: AffiliateEmailTemplate({
					affiliateLink: affiliate_link,
				}) as React.ReactElement,
			});

			return "successfully you have been added as a partner for this product with a business";
		}

		const affiliate = await createAffiliate({
			email,
			first_name,
			last_name,
			description: "",
			social_media_profiles: defaultSocialMediaProfiles,
			wallet_address: "",
		});

		const affiliateLink = `https://www.mangosqueezy.com/buy/${affiliate?.[0]?.id}/${product_id}`;
		const options = {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${SQUZY_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: affiliateLink,
			}),
		};
		const response = await fetch(
			"https://api.squzy.link/links/upsert",
			options,
		);
		const squzyResponse = await response.json();

		const affiliate_link = squzyResponse.shortLink;
		const affiliate_link_key = squzyResponse.id;

		await createAffiliateBusiness({
			business_id,
			affiliate_id: affiliate?.[0]?.id as number,
			product_id: Number(product_id),
			pipeline_id: Number(pipeline_id),
			affiliate_link: affiliate_link,
			affiliate_link_key: affiliate_link_key,
		});

		await resend.emails.send({
			from: "mangosqueezy <amit@tapasom.com>",
			to: [email],
			replyTo: "amit@tapasom.com",
			subject:
				"Thank you for promoting our products! Here's your affiliate link.",
			react: AffiliateEmailTemplate({
				affiliateLink: affiliate_link,
			}) as React.ReactElement,
		});

		return "successfully you have been added as a partner for this product with a business";
	} catch (err) {
		return "An error occurred while creating the affiliate";
	}
}
