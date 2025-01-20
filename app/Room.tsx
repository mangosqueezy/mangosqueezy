"use client";

import {
	ClientSideSuspense,
	LiveblocksProvider,
	RoomProvider,
} from "@liveblocks/react/suspense";
import type { ReactNode } from "react";

export function Room({ children }: { children: ReactNode }) {
	return (
		<LiveblocksProvider
			publicApiKey={
				"pk_dev_IOtV1xrLWyP1WOE1jNLryZx0gmcHCSM3QB4Y712l1fjgec31DEEV8H32V5ysTGey"
			}
		>
			<RoomProvider id="my-room">
				<ClientSideSuspense fallback={<div>Loading…</div>}>
					{children}
				</ClientSideSuspense>
			</RoomProvider>
		</LiveblocksProvider>
	);
}
