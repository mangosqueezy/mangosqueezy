import prisma from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	const body = await request.json();
	const {
		affiliate_id,
		business_id,
		commission,
		amount,
		business_email,
		product_id,
	} = body;

	await prisma.pending_Payments.create({
		data: {
			business_id,
			product_id: Number(product_id),
			full_amount: Number.parseFloat(amount),
			fiat_amount: Number.parseFloat(amount),
		},
	});

	await resend.emails.send({
		from: "mangosqueezy <amit@tapasom.com>",
		to: [business_email],
		subject: "Your Payout Has Been Sent!",
		replyTo: process.env.SLACK_REPLY_TO,
		text: `We're pleased to inform you that your ${amount} has been successfully schedule for payout. If you have any questions or concerns, feel free to reply to this email or contact our support team.`,
	});

	const inFiatCommissionAmount = (commission / 100) * Number.parseFloat(amount);

	await prisma.affiliate_Pending_Payments.create({
		data: {
			affiliate_id,
			product_id: Number(product_id),
			full_amount: Number.parseFloat(amount),
			fiat_amount: inFiatCommissionAmount,
			crypto_amount: 0,
		},
	});

	return new Response("Job started", { status: 200 });
}
