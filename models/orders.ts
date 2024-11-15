import prisma from "@/lib/prisma";

export async function createOrder({
	email,
	business_id,
	product_id,
	affiliate_id,
	quantity,
	customer_address,
}: {
	email: string;
	business_id: string;
	product_id: string;
	affiliate_id: string;
	quantity: number;
	customer_address: string;
}) {
	try {
		await prisma.orders.create({
			data: {
				customer_email: email,
				business_id,
				product_id: Number(product_id),
				affiliate_id: Number(affiliate_id),
				order_quantity: quantity,
				customer_address,
			},
		});
	} catch (err) {
		console.error(err);
	}
}

export async function updateOrdersById(id: string, status: string) {
	return prisma.orders.update({
		where: {
			id,
		},
		data: {
			status,
		},
	});
}
