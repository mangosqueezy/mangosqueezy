import { get } from "@vercel/edge-config";
import { unstable_flag as flag } from "@vercel/flags/next";

export const showManualAffiliateFeature = flag({
	key: "manual_affiliate_feature",
	async decide() {
		const value = await get("manual_affiliate_feature");
		return value ?? false;
	},
});
