"use client";
import { useCallback, useEffect, useState } from "react";
import { AppPortal } from "svix-react";

import "svix-react/style.css";

export type TSvixAppPortalEmbedProps = {
  svix_consumer_app_id: string | null | undefined;
};

export default function SvixAppPortalEmbed({ svix_consumer_app_id }: TSvixAppPortalEmbedProps) {
  const [appPortal, setAppPortal] = useState<string>();

  const getAppPortalUrl = useCallback(async () => {
    const formData = new FormData();
    formData.append("svix_consumer_app_id", svix_consumer_app_id!);
    const response = await fetch(`https://www.mangosqueezy.com/api/svix-portal`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    setAppPortal(result.url);
  }, [svix_consumer_app_id]);

  useEffect(() => {
    if (svix_consumer_app_id) {
      getAppPortalUrl();
    }
  }, [getAppPortalUrl, svix_consumer_app_id]);

  return <AppPortal fullSize url={appPortal} />;
}
