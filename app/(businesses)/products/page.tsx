import Product, { TBusiness } from "./components/product";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/models/business";

export default async function ProductsPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id as string;
  const user: TBusiness | undefined | null = await getUserById(userId);

  return <Product user={user} />;
}
