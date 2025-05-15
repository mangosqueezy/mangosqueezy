import { create } from "zustand";

export type StoreState = {
	price_plan: string;
	setPricePlan: (price_plan: string) => void;
};

export const useStore = create<StoreState>((set) => ({
	price_plan: "trial",
	setPricePlan: (price_plan: string) => set({ price_plan }),
}));
