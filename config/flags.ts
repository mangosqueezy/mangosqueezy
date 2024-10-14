import { get } from "@vercel/edge-config";
import { unstable_flag as flag } from "@vercel/flags/next";

export const showManualAffiliateFeature = flag({
	key: "manual_affiliate_feature",
	async decide() {
		const value = await get("manual_affiliate_feature");
		return value ?? false;
	},
});

export const showInboxFeature = flag({
	key: "inbox_feature",
	async decide() {
		const value = await get("inbox_feature");
		return value ?? false;
	},
});

export const isRealTimePaymentsEnabled = flag({
	key: "affiliates_real_time_payments",
	async decide() {
		const value = await get("affiliates_real_time_payments");
		return value ?? false;
	},
});

export const isMoonpayEnabled = flag({
	key: "moonpay_enabled",
	async decide() {
		const value = await get("moonpay_enabled");
		return value ?? false;
	},
});

export const isIgAssistEnabled = flag({
	key: "ig_assist_enabled",
	async decide() {
		const value = await get("ig_assist_enabled");
		return value ?? false;
	},
});
