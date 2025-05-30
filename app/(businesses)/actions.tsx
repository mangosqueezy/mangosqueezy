"use server";

import { showInboxFeature, showManualAffiliateFeature } from "@/config/flags";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/models/business";

export async function getUser() {
	const supabase = await createClient();

	const { data } = await supabase.auth.getUser();

	if (!data.user?.id) {
		return null;
	}

	const user = await getUserById(data.user?.id as string);

	return user;
}

export async function getShowManualAffiliateFeature() {
	const manualAffiliateFeature = await showManualAffiliateFeature();
	return manualAffiliateFeature;
}

export async function getShowInboxFeature() {
	const inboxFeature = await showInboxFeature();
	return inboxFeature;
}
