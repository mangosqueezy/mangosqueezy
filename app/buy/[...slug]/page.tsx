import { getAffiliateByEmail } from "@/models/affiliates";
import { getProductById } from "@/models/products";
import BuyForm from "./components/form";

export default async function Checkout({ params }: { params: { slug: Array<string> } }) {
  const email = decodeURIComponent(params.slug[0]);
  const user = await getAffiliateByEmail(email as string);
  const productId = parseInt(params.slug[1] as string);
  const product = await getProductById(productId);
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(product?.price || "0"));
  return <BuyForm product={product} formattedAmount={formattedAmount} affiliateId={user?.id} />;
}
