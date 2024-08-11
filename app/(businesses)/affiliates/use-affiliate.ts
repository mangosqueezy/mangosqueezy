import { atom, useAtom } from "jotai";
import type { TMangosqueezy } from "../providers";

type Config = Array<TMangosqueezy> | [];

const configAtom = atom<Config>([]);

export function useAffiliate() {
  return useAtom(configAtom);
}
