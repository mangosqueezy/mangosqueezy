"use client";
import { createContext, useState } from "react";

export type TYoutuber = {
  id: {
    videoId: string;
  };
  snippet: {
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
  };
};

export type TMangosqueezy = {
  metadata: {
    first_name: string;
    email: string;
    id: number;
    description: string;
    metadata: any;
    social_media_profiles: any;
  };
};

interface IContextProps {
  youtuberList: Array<TYoutuber> | [];
  mangoSqueezyList: Array<TMangosqueezy> | [];
  setYoutuberList: (ytList: Array<TYoutuber>) => void;
  setMangosqueezyList: (ytList: Array<TMangosqueezy>) => void;
}

export const BusinessContext = createContext<IContextProps>({
  youtuberList: [],
  mangoSqueezyList: [],
  setYoutuberList: () => {},
  setMangosqueezyList: () => {},
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [youtuberList, setYoutuberList] = useState<Array<TYoutuber> | []>([]);
  const [mangoSqueezyList, setMangosqueezyList] = useState<Array<TMangosqueezy> | []>([]);

  return (
    <BusinessContext.Provider
      value={{ youtuberList, setYoutuberList, mangoSqueezyList, setMangosqueezyList }}
    >
      {children}
    </BusinessContext.Provider>
  );
}
