"use client";
import { useState, useEffect, useCallback } from "react";
import { experimental_useObject as useObject } from "ai/react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Messages } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { replySchema } from "@/app/api/reply/schema";
import type { Products } from "@prisma/client";
import Link from "next/link";
import { Loader, PlusIcon } from "lucide-react";
import { sendEmail, sendNudge } from "../actions";
import toast, { Toaster } from "react-hot-toast";
import { CustomToast } from "@/components/mango-ui/custom-toast";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

export type TReplyMessage = {
  id: string;
  message: string;
};

export type TMessages = Messages & {
  replies: Messages[];
};

interface MailDisplayProps {
  mail: TMessages | null;
  products: Array<Products> | undefined;
  businessId: string;
}

const MessageHeader = ({ mail }: { mail: Messages }) => (
  <div className="flex items-start p-4">
    <div className="flex items-start gap-4 text-sm">
      <Avatar>
        <AvatarImage alt={mail.name as string} />
        <AvatarFallback>
          {mail.name &&
            mail.name
              .split(" ")
              .map(chunk => chunk[0])
              .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <div className="font-semibold">{mail.name}</div>
        <div className="line-clamp-1 text-xs">{mail.subject}</div>
        <div className="line-clamp-1 text-xs">
          <span className="font-medium">Reply-To:</span> {mail.email}
        </div>
      </div>
    </div>
    {mail.sent_at && (
      <div className="ml-auto text-xs text-muted-foreground">
        {format(new Date(mail.sent_at), "PPpp")}
      </div>
    )}
  </div>
);

const ReplyForm = ({
  replyMessage,
  setReplyMessage,
  recipientName,
  mail,
  products,
  businessId,
}: {
  recipientName: string;
  mail: TMessages | null;
  products: Array<Products> | undefined;
  businessId: string;
  replyMessage: TReplyMessage;
  setReplyMessage: (value: TReplyMessage) => void;
}) => {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    object,
    submit,
    isLoading: replyIsLoading,
  } = useObject({
    api: "/api/reply",
    schema: replySchema,
  });

  useEffect(() => {
    if (object?.email?.content) {
      setReplyMessage({
        id: mail?.id as string,
        message: object.email.content,
      });
    }
  }, [object?.email?.content, mail?.id, setReplyMessage]);

  useEffect(() => {
    if (mail?.id !== replyMessage.id) {
      setReplyMessage({
        id: "",
        message: "",
      });
    }
  }, [mail?.id, setReplyMessage, replyMessage.id]);

  const sendListner = useCallback(async () => {
    setIsLoading(true);

    if (!value) {
      toast.custom(t => (
        <CustomToast
          t={t}
          message="Please select the product before you send the message."
          variant="error"
        />
      ));
    } else if (!replyMessage.message) {
      toast.custom(t => (
        <CustomToast t={t} message="Please enter the reply message." variant="error" />
      ));
    } else {
      const parsedAffiliateName =
        mail?.name &&
        mail.name
          .split(" ")
          .map(chunk => chunk[0])
          .join("");
      const formData = new FormData();
      formData.append("email", mail?.email ?? "");
      formData.append("name", parsedAffiliateName as string);
      formData.append("product-id", value);
      formData.append("email-content", replyMessage.message as string);
      formData.append(
        "is-affiliate-link",
        object?.email?.affiliateLink ? object?.email?.affiliateLink.toString() : ""
      );
      formData.append("business-id", businessId);
      formData.append("parent-id", mail?.id as string);

      if (mail) {
        const isNudge = mail.type === "nudge";
        const isEmail = mail.type === "email";

        if (isNudge || isEmail) {
          let success = false;

          if (isNudge) {
            formData.append("channel-id", mail.channel_id as string);
            formData.append("video-id", mail.video_id as string);
            const { nudgeResult } = await sendNudge(formData);
            success = !!nudgeResult?.id;
          } else {
            const response = await sendEmail(formData);
            success = !!response.data?.id;
          }

          toast.custom(t => (
            <CustomToast
              t={t}
              message={success ? "Message sent successfully." : "Something went wrong."}
              variant={success ? "success" : "error"}
            />
          ));
        }
      }
    }

    setIsLoading(false);
  }, [replyMessage, object?.email?.affiliateLink, value, businessId, mail]);

  return (
    <div className="p-4">
      <div className="grid gap-4">
        <Textarea
          className="p-4 h-52"
          placeholder={`Reply ${recipientName}...`}
          onChange={e =>
            setReplyMessage({
              id: mail?.id as string,
              message: e.target.value,
            })
          }
          value={replyMessage.message}
        />
        <div className="flex items-center">
          {products && products?.length > 0 ? (
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Products</SelectLabel>
                  {products &&
                    products.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Link
              href="/products"
              className="flex justify-center items-center text-sm text-blue-600"
            >
              <PlusIcon className="size-4 mr-2" />
              Add Product
            </Link>
          )}

          <Button
            variant="secondary"
            onClick={() => submit(JSON.stringify(mail))}
            size="sm"
            disabled={replyIsLoading}
            className={cn(
              "inline-flex ml-auto justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
              replyIsLoading && "cursor-not-allowed"
            )}
          >
            {replyIsLoading && <Loader className="-ml-0.5 h-5 w-5 text-black animate-spin" />}
            Create reply
          </Button>
          <Button
            onClick={sendListner}
            disabled={isLoading}
            size="sm"
            className={cn(
              "inline-flex ml-auto justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
              isLoading && "cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader className="-ml-0.5 h-5 w-5 text-black animate-spin" />
            ) : (
              <EnvelopeIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageBody = ({ message }: { message: string }) => (
  <div className="flex-1 whitespace-pre-wrap p-4 text-sm">{message}</div>
);

const MessageDisplay = ({ mail }: { mail: Messages }) => (
  <div className="flex flex-1 flex-col">
    <MessageHeader mail={mail} />
    <Separator />
    <MessageBody message={mail.message} />
    <Separator className="my-10" />
  </div>
);

export function MailDisplay({ mail, products, businessId }: MailDisplayProps) {
  const [replyMessage, setReplyMessage] = useState<TReplyMessage>({
    id: "",
    message: "",
  });

  if (!mail) {
    return <div className="p-8 text-center text-muted-foreground">No message selected</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex min-h-screen flex-col">
        <Separator />
        <MessageDisplay mail={mail} />
        {mail.replies.length === 0 && (
          <ReplyForm
            recipientName={mail.name as string}
            mail={mail}
            products={products}
            businessId={businessId}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
          />
        )}
        {mail.replies.map((replyMail, index) => (
          <div key={replyMail.id}>
            <MessageDisplay mail={replyMail} />
            {index === mail.replies.length - 1 && (
              <ReplyForm
                recipientName={replyMail.name as string}
                mail={mail}
                products={products}
                businessId={businessId}
                replyMessage={replyMessage}
                setReplyMessage={setReplyMessage}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
