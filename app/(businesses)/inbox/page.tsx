import { Mail } from "@/app/(businesses)/inbox/components/mail";
import { mails } from "@/app/(businesses)/inbox/data";

export default function MailPage() {
  return (
    <div className="h-full flex-col md:flex">
      <Mail mails={mails} />
    </div>
  );
}
