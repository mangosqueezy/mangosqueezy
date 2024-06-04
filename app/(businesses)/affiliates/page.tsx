"use client";
import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import { BusinessContext } from "../providers";

export default function AffiliatePage() {
  const context = useContext(BusinessContext);
  const { youtuberList, setYoutuberList } = context;
  const [searchQuery, setSearchQuery] = useState<string>("");

  const searchYoutuberAPI = async () => {
    const parameters = {
      part: "snippet",
      q: searchQuery,
      key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!,
      type: "channel,video,playlist",
      maxResults: "20",
    };
    const queryParameter = new URLSearchParams(parameters);
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?${queryParameter.toString()}`,
      {
        method: "GET",
      },
    );

    const result = await response.json();

    setYoutuberList(result.items);
  };

  return (
    <>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="email"
          placeholder="search a youtuber..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event?.target.value)}
        />
        <Button onClick={searchYoutuberAPI}>Search</Button>
      </div>

      <ul role="list" className="divide-y divide-gray-100">
        {youtuberList &&
          youtuberList.map((youtuber) => (
            <li
              key={youtuber.snippet.channelId}
              className="relative flex justify-between gap-x-6 py-5"
            >
              <div className="flex min-w-0 gap-x-4">
                <Image
                  className="w-auto h-auto flex-none rounded-xl bg-gray-50"
                  src={youtuber.snippet.thumbnails.high.url}
                  width={200}
                  height={200}
                  alt=""
                />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    <Link
                      href={`/affiliates/${youtuber.snippet.channelId}/${youtuber.id.videoId}`}
                    >
                      <span className="absolute inset-x-0 -top-px bottom-0" />
                      {youtuber.snippet.channelTitle}
                    </Link>
                  </p>

                  <p className="mt-1 flex text-xs leading-5 text-gray-500">
                    {youtuber.snippet.description}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">
                <ChevronRightIcon
                  className="h-5 w-5 flex-none text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </li>
          ))}
      </ul>
    </>
  );
}
