"use client";
import { useEffect, useState } from "react";
import { AppPortal } from "svix-react";

import "svix-react/style.css";

export default function SvixEmbed() {
  const [appPortal, setAppPortal] = useState<string>();

  async function getAppPortalUrl() {
    const response = await fetch(`https://mangosqueezy.com/api/svix`, { method: "POST" });
    const result = await response.json();

    setAppPortal(result.url);
  }

  useEffect(() => {
    getAppPortalUrl();
  }, []);

  return <AppPortal fullSize url={appPortal} />;
}
