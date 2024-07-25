import { atom, useAtom } from "jotai";
import type { Messages } from "@prisma/client";

type Config = {
  selected: Messages["id"] | null;
};

const configAtom = atom<Config>({
  selected: null,
});

export function useMail() {
  return useAtom(configAtom);
}
