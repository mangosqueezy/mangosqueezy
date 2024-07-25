import { Mail } from "@/app/(businesses)/inbox/components/mail";
import { getUser } from "../actions";
import { getMessages } from "@/models/messages";

export const revalidate = 0;

export default async function MailPage() {
  const user = await getUser();
  const messages = await getMessages({ business_id: user?.id as string });

  return (
    <div className="h-full flex-col md:flex">
      <Mail mails={messages} products={user?.products} businessId={user?.id as string} />
    </div>
  );
}
