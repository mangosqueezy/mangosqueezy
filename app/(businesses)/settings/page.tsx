"use client";
import { useCallback, useEffect, useState } from "react";
import { getUser } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>{`Your profile settings`}</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  disabled
                  type="email"
                  value={loggedInUser?.email}
                  id="email"
                  className="cursor-not-allowed"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
