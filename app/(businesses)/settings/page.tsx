"use client";
import { useCallback, useEffect, useState } from "react";
import { getUser } from "../actions";
import Intercom from "@intercom/messenger-js-sdk";

import { getUserHash } from "./actions";

export default function Settings() {
  const [loggedInUser, setLoggedInUser] = useState<any>();
  const [userHash, setUserHash] = useState<any>(null);

  const getLoggedInUser = async () => {
    const user = await getUser();
    setLoggedInUser(user);
  };

  useEffect(() => {
    getLoggedInUser();
  }, []);

  const getLoggedInUserHash = useCallback(async () => {
    const hash = await getUserHash(loggedInUser?.id);
    setUserHash(hash);
  }, [loggedInUser?.id]);

  useEffect(() => {
    if (loggedInUser?.id) {
      getLoggedInUserHash();
    }
  }, [loggedInUser?.id, getLoggedInUserHash]);

  {
    loggedInUser?.id &&
      userHash &&
      Intercom({
        app_id: "kby3tvbo",
        user_id: loggedInUser?.id,
        email: loggedInUser?.email,
        user_hash: userHash,
      });
  }

  return <div>Setting</div>;
}
