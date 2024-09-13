import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/models/business";
import Product, { type TBusiness } from "./components/product";

export default async function ProductsPage() {
	const supabase = createClient();
	const { data } = await supabase.auth.getUser();
	const userId = data?.user?.id as string;
	const user: TBusiness | undefined | null = await getUserById(userId);

	return <Product user={user} />;
}
