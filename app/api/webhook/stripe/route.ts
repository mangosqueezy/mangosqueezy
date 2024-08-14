import { Resend } from "resend";
import Stripe from "stripe";
import isEmpty from "lodash/isEmpty";
import { createOrderAction } from "@/app/buy/[...slug]/actions";

const stripe = new Stripe(process.env.STRIPE_SK!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const secret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET as string;
    const sig: any = request.headers.get("stripe-signature");
    let event;
    const payload = await request.text();

    try {
      event = stripe.webhooks.constructEvent(payload, sig, secret);
    } catch (err: any) {
      return new Response(err.message, {
        status: 400,
      });
    }

    if (event.type === "checkout.session.completed") {
      const stripeEventResult: any = event.data.object;
      const customer_email = stripeEventResult.customerEmail;
      const business_id = stripeEventResult.businessId;
      const affiliate_id = stripeEventResult.affiliateId;
      const product_id = stripeEventResult.productId;
      const amount = stripeEventResult.amount;

      if (!isEmpty(customer_email)) {
        await resend.emails.send({
          from: "amit@tapasom.com",
          to: customer_email,
          subject: `Payment Confirmation`,
          html: `
            <div class="container">
              <p>Dear Customer,</p>
              <p>We are delighted to inform you that your subscription payment has been successfully processed. Thank you for choosing Tapasom as your preferred service provider.</p>
              <p>Your subscription is now active, and you can enjoy uninterrupted access to our service. We greatly value your continued support and trust in our services.</p>
              <p>If you have any questions regarding your subscription, billing, or if you encounter any issues, please do not hesitate to contact our customer support team at amit@tapasom.com. We are here to assist you and ensure you have a seamless experience.</p>
              <p>Once again, thank you for being a part of Tapasom. We look forward to serving you and providing you with an exceptional experience.</p>
              <p>Best regards,</p>
              <p>Tapasom</p>
            </div>
          `,
        });
      }

      const formData = new FormData();
      formData.append("email", customer_email);
      formData.append("business_id", business_id as string);
      formData.append("product_id", product_id.toString());
      formData.append("affiliate_id", affiliate_id.toString());
      formData.append("amount", amount as string);

      await createOrderAction(formData);
    }

    return Response.json("success", { status: 200 });
  } catch (err) {
    return Response.json("failed", { status: 400 });
  }
}
