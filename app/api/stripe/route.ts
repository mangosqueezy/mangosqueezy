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
	const quantity: string = body.get("quantity") as string;
	const customer_address: string = body.get("customer_address") as string;

	const price = await stripe.prices.create({
		currency: "usd",
		unit_amount: Number.parseFloat(amount) * 100,
		product_data: {
			name: productName,
		},
	});

	const session = await stripe.checkout.sessions.create({
		customer_email: email,
		line_items: [
			{
				price: price.id,
				quantity: 1,
			},
		],
		automatic_tax: {
			enabled: true,
		},
		invoice_creation: {
			enabled: true,
			invoice_data: {
				metadata: {
					customerEmail: email,
					businessId,
					affiliateId,
					productId,
					amount,
					quantity: quantity ? Number(quantity) : 0,
					customer_address,
				},
			},
		},
		allow_promotion_codes: true,
		mode: "payment",
		success_url: "https://mangosqueezy.com/success",
		cancel_url: "https://mangosqueezy.com/error",
	});

	return Response.json(session.url);
}
