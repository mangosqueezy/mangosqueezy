import prisma from "@/lib/prisma";
import { Client, Wallet, getBalanceChanges, xrpToDrops } from "@transia/xrpl";
import { logger, task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import { Svix } from "svix";

const SVIX_API_KEY = process.env.SVIX_API_KEY;
const svix = new Svix(SVIX_API_KEY!);

type PaymentPreference = "FullCrypto" | "HalfCryptoHalfFiat" | "FullFiat";

type TPayload = {
	business_id: string;
	commission: number;
	amount: string;
	business_wallet_address: string;
	affiliate_wallet_address: string;
	business_email: string;
	affiliate_email: string;
	product_id: string;
	email: string;
	svix_consumer_app_id: string;
	payment_preference: PaymentPreference | undefined;
};

export const payoutTask = task({
	id: "payout-task",
	run: async (payload: TPayload, { ctx }) => {
		logger.log("payout task...", { payload, ctx });

		const {
			business_id,
			commission,
			amount,
			business_wallet_address,
			affiliate_wallet_address,
			business_email,
			affiliate_email,
			payment_preference,
			product_id,
		} = payload;

		const options = {
			method: "GET",
			headers: {
				accept: "application/json",
				"Content-Type": "application/json",
				"X-API-Key": process.env.XUMM_API_KEY!,
				"X-API-Secret": process.env.XUMM_API_SECRET!,
			},
		};

		const ratesResponse = await fetch(
			"https://xumm.app/api/v1/platform/rates/USD",
			options,
		);
		const rates = await ratesResponse.json();

		const parsedAmount =
			Number.parseFloat(amount) / Number.parseFloat(rates.XRP);

		const resend = new Resend(process.env.RESEND_API_KEY);
		const net = process.env.XAHAU_NETWORK!;
		const client = new Client(net);
		await client.connect();

		const mangosqueezy_wallet = Wallet.fromSeed(
			process.env.MANGOSQUEEZY_WALLET_SECRET_SEED!,
		);
		const commissionAmount = (commission / 100) * parsedAmount;
		const amountForBusiness = parsedAmount - commissionAmount;
		let result = "success";
		try {
			if (payment_preference === "FullCrypto") {
				const businessPayload = await client.autofill({
					TransactionType: "Payment",
					Account: mangosqueezy_wallet.address,
					Amount: xrpToDrops(amountForBusiness),
					NetworkID: 21338,
					Destination: business_wallet_address, // wallet address of the business user
				});

				const signed = mangosqueezy_wallet.sign(businessPayload);

				// biome-ignore lint: do not have export type for submitAndWait
				const businessTransaction: any = await client.submitAndWait(
					signed.tx_blob,
				);

				logger.log(
					"payout task for business result is with full crypto as a payment preference...",
					{
						balance: getBalanceChanges(businessTransaction?.result.meta),
						payment_preference,
					},
				);

				const { data, error } = await resend.emails.send({
					from: "mangosqueezy <amit@tapasom.com>",
					to: [business_email],
					subject: "Your Payout Has Been Sent!",
					replyTo: process.env.SLACK_REPLY_TO,
					text: `We're pleased to inform you that your payout has been successfully sent to your account. If you have any questions or concerns, feel free to reply to this email or contact our support team.`,
				});

				logger.log("email sent to business user...", {
					emails: { business_email },
					data,
					error,
				});

				await prisma.pending_Payments.create({
					data: {
						business_id,
						product_id: Number(product_id),
						full_amount: Number.parseFloat(amount),
						crypto_amount: amountForBusiness,
					},
				});
			} else if (payment_preference === "HalfCryptoHalfFiat") {
				const halfAmount = amountForBusiness / 2;
				const businessPayload = await client.autofill({
					TransactionType: "Payment",
					Account: mangosqueezy_wallet.address,
					Amount: xrpToDrops(halfAmount),
					NetworkID: 21338,
					Destination: business_wallet_address, // wallet address of the business user
				});

				const signed = mangosqueezy_wallet.sign(businessPayload);

				// biome-ignore lint: do not have export type for submitAndWait
				const businessTransaction: any = await client.submitAndWait(
					signed.tx_blob,
				);

				await prisma.pending_Payments.create({
					data: {
						business_id,
						product_id: Number(product_id),
						full_amount: Number.parseFloat(amount),
						fiat_amount: Number.parseFloat(amount) / 2,
						crypto_amount: halfAmount,
					},
				});

				logger.log(
					"payout task for business result is with half crypto as a payment preference...",
					{
						balance: getBalanceChanges(businessTransaction?.result.meta),
						payment_preference,
					},
				);

				const { data, error } = await resend.emails.send({
					from: "mangosqueezy <amit@tapasom.com>",
					to: [business_email],
					subject: "Your Payout Has Been Sent!",
					replyTo: process.env.SLACK_REPLY_TO,
					text: `We're pleased to inform you that your ${halfAmount} crypto has been successfully sent to your account. If you have any questions or concerns, feel free to reply to this email or contact our support team.`,
				});

				logger.log("email sent to business user...", {
					emails: { business_email },
					data,
					error,
				});
			} else {
				await prisma.pending_Payments.create({
					data: {
						business_id,
						product_id: Number(product_id),
						full_amount: Number.parseFloat(amount),
						fiat_amount: Number.parseFloat(amount),
					},
				});

				logger.log(
					"payout task for business result is with full fiat as a payment preference...",
					{
						payment_preference,
					},
				);

				const { data, error } = await resend.emails.send({
					from: "mangosqueezy <amit@tapasom.com>",
					to: [business_email],
					subject: "Your Payout Has Been Sent!",
					replyTo: process.env.SLACK_REPLY_TO,
					text: `We're pleased to inform you that your ${amount} has been successfully schedule for payout. If you have any questions or concerns, feel free to reply to this email or contact our support team.`,
				});

				logger.log("email sent to business user...", {
					emails: { business_email },
					data,
					error,
				});
			}

			const affiliatePayload = await client.autofill({
				TransactionType: "Payment",
				Account: mangosqueezy_wallet.address,
				Amount: xrpToDrops(commissionAmount),
				NetworkID: 21338,
				Destination: affiliate_wallet_address, // wallet address of the affiliate user
			});

			const affiliateSigned = mangosqueezy_wallet.sign(affiliatePayload);

			// biome-ignore lint: do not have export type for submitAndWait
			const affiliateTransaction: any = await client.submitAndWait(
				affiliateSigned.tx_blob,
			);

			logger.log("payout task for affiliate result is...", {
				balance: getBalanceChanges(affiliateTransaction?.result.meta),
			});

			const { data, error } = await resend.emails.send({
				from: "mangosqueezy <amit@tapasom.com>",
				to: [affiliate_email],
				subject: "Your Payout Has Been Sent!",
				replyTo: process.env.SLACK_REPLY_TO,
				text: `We're pleased to inform you that your payout has been successfully sent to your account. If you have any questions or concerns, feel free to reply to this email or contact our support team.`,
			});

			logger.log("email sent to users...", {
				emails: { affiliate_email },
				data,
				error,
			});
		} catch (error) {
			result = "error";
			console.error(error);
		}

		client.disconnect();

		return result;
	},
	onSuccess: async (payload, output, { ctx }) => {
		const { product_id, email, svix_consumer_app_id } = payload;
		const {
			task: { id: task_id },
		} = ctx;

		logger.log("svix is triggered with task_id ...", {
			task_id,
			payload,
			output,
		});

		await svix.message.create(svix_consumer_app_id, {
			eventType: "invoice.paid",
			eventId: task_id,
			payload: {
				type: "invoice.paid",
				product_id,
				status: "paid",
				email,
			},
		});
	},
});
