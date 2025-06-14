import isEmpty from "lodash/isEmpty";
import { Resend } from "resend";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK!, {
	apiVersion: "2025-04-30.basil",
	httpClient: Stripe.createFetchHttpClient(),
});

export async function POST(request: Request) {
	try {
		const resend = new Resend(process.env.RESEND_API_KEY);
		const secret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET as string;
		const sig = request.headers.get("stripe-signature") as string;
		let event: Stripe.Event;
		const payload = await request.text();

		try {
			event = stripe.webhooks.constructEvent(payload, sig, secret);
		} catch (err: unknown) {
			return new Response((err as Error).message, {
				status: 400,
			});
		}

		if (event.type === "invoice.payment_succeeded") {
			const stripeEventResult: Stripe.Invoice = event.data.object;
			const customer_email = stripeEventResult?.customer_email;

			const subscriptionId = stripeEventResult?.id;
			const subscription = await stripe.subscriptions.retrieve(
				subscriptionId || "",
			);

			const emailText =
				subscription.status === "trialing"
					? "We are delighted to inform you that your trial period has started. You will have access to all features for starter plan during this time"
					: "We are delighted to inform you that your payment has been successfully processed";

			if (!isEmpty(customer_email)) {
				await resend.emails.send({
					from: "amit@tapasom.com",
					to: customer_email!,
					subject: "Payment Confirmation",
					html: `
            <div class="container">
              <p>Dear Customer,</p>
              <p>${emailText}. Thank you for choosing mangosqueezy.</p>
              <p>If you have any questions regarding your payment, or if you encounter any issues, please do not hesitate to contact our customer support team at amit@tapasom.com. We are here to assist you and ensure you have a seamless experience.</p>
              <p>Once again, thank you for being a part of mangosqueezy. We look forward to serving you and providing you with an exceptional experience.</p>
              <p>Best regards,</p>
              <p>mangosqueezy</p>
            </div>
          `,
				});
			}
		} else if (event.type === "payment_intent.succeeded") {
			const stripeEventResult: Stripe.PaymentIntent = event.data.object;
			const customer_email = stripeEventResult.customer as Stripe.Customer;

			if (!isEmpty(customer_email.email)) {
				await resend.emails.send({
					from: "amit@tapasom.com",
					to: customer_email.email!,
					subject: "Payment Confirmation",
					html: `
            <div class="container">
              <p>Dear Customer,</p>
              <p>We are delighted to inform you that your payment has been successfully processed. Thank you for choosing mangosqueezy.</p>
              <p>If you have any questions regarding your payment, or if you encounter any issues, please do not hesitate to contact our customer support team at amit@tapasom.com. We are here to assist you and ensure you have a seamless experience.</p>
			  <p>Best regards,</p>
              <p>mangosqueezy</p>
            </div>
          `,
				});
			}
		}

		return Response.json("success", { status: 200 });
	} catch (err) {
		return Response.json("failed", { status: 400 });
	}
}
