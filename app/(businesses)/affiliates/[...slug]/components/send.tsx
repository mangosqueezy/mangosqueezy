"use client";
import * as React from "react";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import { CustomToast } from "@/components/mango-ui/custom-toast";

type TSend = {
  extractedDescription: {
    email?: string | null | undefined;
    urls?: string[] | null | undefined;
  } | null;
  profile: any;
  videoId: string;
  businessId: string;
  channelId: string;
};

export function Send({ extractedDescription, profile, videoId, businessId, channelId }: TSend) {
  const [isLoading, setIsLoading] = React.useState(false);

  const sendMessage = async () => {
    setIsLoading(true);
    const email = extractedDescription?.email;

    const formData = new FormData();
    let result;

    if (email) {
      formData.append("email-id", email);
      formData.append("name", profile.items[0].snippet.title);
      formData.append("business_id", businessId);

      const response = await fetch("https://www.mangosqueezy.com/api/email", {
        method: "POST",
        body: formData,
      });

      result = await response.json();
    } else {
      formData.append("name", profile.items[0].snippet.title);
      formData.append("business_id", businessId);
      formData.append("channel_id", channelId);
      formData.append("video_id", videoId);

      // nudge influencer's youtube channel
      const response = await fetch("https://www.mangosqueezy.com/api/nudge", {
        method: "POST",
        body: formData,
      });

      result = await response.json();
    }

    setIsLoading(false);

    if (result?.id) {
      toast.custom(t => (
        <CustomToast
          t={t}
          message="Message sent successfully. You can check your sent messages on the inbox page."
          variant="success"
        />
      ));
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <button
        type="button"
        disabled={isLoading}
        onClick={() => sendMessage()}
        className={cn(
          "inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
          isLoading && "cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <Loader className="-ml-0.5 h-5 w-5 text-gray-400 animate-spin" />
        ) : (
          <EnvelopeIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
        )}
        {extractedDescription?.email ? "Email" : "Nudge"}
      </button>
    </>
  );
}
