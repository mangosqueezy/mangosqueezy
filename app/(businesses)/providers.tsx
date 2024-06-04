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

interface IContextProps {
  youtuberList: Array<TYoutuber> | [];
  setYoutuberList: (ytList: Array<TYoutuber>) => void;
}

export const BusinessContext = createContext<IContextProps>({
  youtuberList: [],
  setYoutuberList: () => {},
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [youtuberList, setYoutuberList] = useState<Array<TYoutuber> | []>([]);

  return (
    <BusinessContext.Provider value={{ youtuberList, setYoutuberList }}>
      {children}
    </BusinessContext.Provider>
  );
}
