"use client";

import { Composer, Thread } from "@liveblocks/react-ui";
import { useThreads } from "@liveblocks/react/suspense";

export function CollaborativeApp() {
	const { threads } = useThreads();

	return (
		<div>
			{threads.map((thread) => (
				<Thread key={thread.id} thread={thread} />
			))}
			<Composer />
		</div>
	);
}
