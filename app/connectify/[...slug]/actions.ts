"use server";

import { getAffiliateBusinessInfoById } from "@/models/affiliate_business";
import {
	createAffiliate,
	createAffiliateBusiness,
	getAffiliateByEmail,
} from "@/models/affiliates";
import { Dub } from "dub";

const defaultSocialMediaProfiles = {
	url: "",
	youtube: "",
	instagram: "",
};

const DUB_API_KEY = process.env.DUB_API_KEY;

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
			const affiliateBusinessInformation = await getAffiliateBusinessInfoById(
				business_id,
				affiliateInformation.id,
			);

			const isAffiliateAlreadyPartner =
				affiliateBusinessInformation?.affiliate.email === email &&
				affiliateBusinessInformation?.business.products.some(
					(product) => product.id === Number(product_id),
				);

			if (isAffiliateAlreadyPartner) {
				return "You are already a partner for this product with this business";
			}

			const dub = new Dub({
				token: DUB_API_KEY as string,
			});
			const affiliateLink = `https://www.mangosqueezy.com/buy/${affiliateInformation.id}/${product_id}`;
			const dubResponse = await dub.links.upsert({
				url: affiliateLink,
			});

			const affiliate_link = dubResponse.shortLink;
			const affiliate_link_key = dubResponse.key;

			await createAffiliateBusiness({
				business_id,
				affiliate_id: Number(affiliateInformation.id),
				product_id: Number(product_id),
				pipeline_id: pipeline_id ? Number(pipeline_id) : null,
				affiliate_link: affiliate_link,
				affiliate_link_key: affiliate_link_key,
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

		const dub = new Dub({
			token: DUB_API_KEY as string,
		});
		const affiliateLink = `https://www.mangosqueezy.com/buy/${affiliate?.[0]?.id}/${product_id}`;
		const dubResponse = await dub.links.upsert({
			url: affiliateLink,
		});

		const affiliate_link = dubResponse.shortLink;
		const affiliate_link_key = dubResponse.key;

		await createAffiliateBusiness({
			business_id,
			affiliate_id: affiliate?.[0]?.id as number,
			product_id: Number(product_id),
			pipeline_id: Number(pipeline_id),
			affiliate_link: affiliate_link,
			affiliate_link_key: affiliate_link_key,
		});

		return "successfully you have been added as a partner for this product with a business";
	} catch (err) {
		return "An error occurred while creating the affiliate";
	}
}
