import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK!);

export async function POST(request: Request) {
  const body = await request.formData();
  const productName: string = body.get("product_name") as string;
  const amount: string = body.get("amount") as string;
  const email: string = body.get("email") as string;
  const businessId: string = body.get("business_id") as string;
  const affiliateId: string = body.get("affiliate_id") as string;
  const productId: string = body.get("product_id") as string;

  const price = await stripe.prices.create({
    currency: "usd",
    unit_amount: parseFloat(amount) * 100,
    product_data: {
      name: productName,
    },
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      customerEmail: email,
      businessId,
      affiliateId,
      productId,
      amount,
    },
  });

  return Response.json(paymentLink.url);
}
