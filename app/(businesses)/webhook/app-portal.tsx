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
    const response = await fetch(`https://www.mangosqueezy.com/api/svix-portal`, {
      method: "POST",
      body: JSON.stringify({ svix_consumer_app_id }),
    });
    const result = await response.json();

    setAppPortal(result.url);
  }, [svix_consumer_app_id]);

  useEffect(() => {
    getAppPortalUrl();
  }, [getAppPortalUrl]);

  return <AppPortal fullSize url={appPortal} />;
}
