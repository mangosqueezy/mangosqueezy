import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/models/business";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK!);

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get("code");

	const supabase = await createClient();

	const { data } = await supabase.auth.getUser();

	if (!data.user?.id) {
		// Redirect to settings if user is not authenticated
		return NextResponse.redirect(new URL("/settings", request.url));
	}

	const user = await getUserById(data.user?.id as string);

	if (!code) {
		// TODO: need to handle this better
		return NextResponse.redirect(new URL("/settings", request.url));
	}

	const response = await stripe.oauth.token({
		grant_type: "authorization_code",
		code,
	});

	const connected_account_id = response.stripe_user_id;

	await prisma.business.update({
		where: {
			id: user?.id,
		},
		data: {
			stripe_connected_account: connected_account_id,
		},
	});

	return NextResponse.redirect(new URL("/settings", request.url));
}
