"use server";

import { updateBusinessInfoById } from "@/models/business";
import { Svix } from "svix";

const SVIX_API_KEY = process.env.SVIX_API_KEY;
const svix = new Svix(SVIX_API_KEY!);

type FormData = {
	first_name: string;
	last_name: string;
	description: string;
	commission: number;
	email: string;
};

export async function updateOnboardingAction(
	user_id: string,
	formData: FormData,
) {
	const { first_name, last_name, description, commission, email } = formData;

	if (!first_name || !last_name || !description || commission === undefined) {
		return { error: "All fields are required." };
	}

	if (commission <= 0) {
		return { error: "Commission must be greater than 0." };
	}

	const applicationOut = await svix.application.create({
		name: user_id,
	});

	const user = await updateBusinessInfoById({
		id: user_id,
		first_name,
		last_name,
		description,
		commission,
		svix_consumer_app_id: applicationOut.id,
	});

	return user;
}
