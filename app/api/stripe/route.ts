import prisma from "@/lib/prisma";
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
	const price_type: string = body.get("price_type") as string;
	const stripeConnectedAccount: string = body.get(
		"stripe_connected_account",
	) as string;

	let priceObject: Stripe.PriceCreateParams = {
		currency: "usd",
		unit_amount: Number.parseFloat(amount) * 100,
		product_data: {
			name: productName,
		},
	};

	const paymentMode =
		price_type === "Subscription" ? "subscription" : "payment";

	const productData = await prisma.products.findUnique({
		where: {
			id: Number(productId),
		},
	});

	let retrievedPrice: Stripe.Price;
	if (stripeConnectedAccount) {
		retrievedPrice = await stripe.prices.retrieve(
			productData?.stripe_price_id as string,
			{
				stripeAccount: stripeConnectedAccount,
			},
		);
	} else {
		retrievedPrice = await stripe.prices.retrieve(
			productData?.stripe_price_id as string,
		);
	}

	if (price_type === "Subscription") {
		priceObject = {
			...priceObject,
			recurring: {
				interval: "month",
			},
		} as Stripe.PriceCreateParams;
	}

	let price: Stripe.Price;
	if (
		retrievedPrice?.id &&
		retrievedPrice?.unit_amount !== Number.parseFloat(amount) * 100
	) {
		if (stripeConnectedAccount) {
			price = await stripe.prices.create(priceObject, {
				stripeAccount: stripeConnectedAccount,
			});
		} else {
			price = await stripe.prices.create(priceObject);
		}
		await prisma.products.update({
			where: {
				id: Number(productId),
			},
			data: {
				stripe_price_id: price.id,
			},
		});
	} else {
		price = retrievedPrice;
	}

	const parsedPriceId = price.id;
	let sessionParams: Stripe.Checkout.SessionCreateParams = {
		customer_email: email,
		line_items: [
			{
				price: parsedPriceId,
				quantity: quantity ? Number(quantity) : 1,
			},
		],
		automatic_tax: {
			enabled: true,
		},
		allow_promotion_codes: true,
		mode: paymentMode as Stripe.Checkout.SessionCreateParams.Mode,
		success_url: "https://mangosqueezy.com/success",
		cancel_url: "https://mangosqueezy.com/error",
	};

	if (paymentMode === "payment") {
		sessionParams = {
			...sessionParams,
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
		};
	}

	let session: Stripe.Checkout.Session;
	if (stripeConnectedAccount) {
		session = await stripe.checkout.sessions.create(sessionParams, {
			stripeAccount: stripeConnectedAccount,
		});
	} else {
		session = await stripe.checkout.sessions.create(sessionParams);
	}

	return Response.json(session.url);
}
