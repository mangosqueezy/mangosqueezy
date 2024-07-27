import prisma from "@/lib/prisma";

export async function createOrder({
  email,
  business_id,
  product_id,
  affiliate_id,
}: {
  email: string;
  business_id: string;
  product_id: string;
  affiliate_id: string;
}) {
  try {
    await prisma.orders.create({
      data: {
        customer_email: email,
        business_id,
        product_id: Number(product_id),
        affiliate_id: Number(affiliate_id),
      },
    });
  } catch (err) {
    console.error(err);
  }
}
