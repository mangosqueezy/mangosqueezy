"use client";

import { MailDisplay } from "@/app/(businesses)/inbox/components/mail-display";
import { MailList } from "@/app/(businesses)/inbox/components/mail-list";
import { useMail } from "@/app/(businesses)/inbox/use-mail";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Products } from "@prisma/client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { getShowInboxFeature } from "../../actions";
import type { TMessages } from "./mail-display";

interface MailProps {
	mails: TMessages[];
	products: Array<Products> | undefined;
	businessId: string;
}

export function Mail({ mails, products, businessId }: MailProps) {
	const [mail, setMail] = useMail();
	const router = useRouter();

	React.useEffect(() => {
		const fetchShowInboxFeature = async () => {
			const showInboxFeature = await getShowInboxFeature();
			if (!showInboxFeature) {
				router.push("/pipeline");
			}
		};

		fetchShowInboxFeature();
	}, [router]);

	React.useEffect(() => {
		setMail({
			selected: mails[0]?.id || null,
		});
	}, [mails, setMail]);

	return (
		<TooltipProvider delayDuration={0}>
			<ResizablePanelGroup
				direction="horizontal"
				onLayout={(sizes: number[]) => {
					document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
				}}
				className="h-full max-h-[860px] items-stretch"
			>
				<ResizablePanel defaultSize={265} minSize={20}>
					<MailList items={mails} />
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel defaultSize={655}>
					<ScrollArea className="h-full w-full">
						<MailDisplay
							mail={mails.find((item) => item.id === mail.selected) || null}
							products={products}
							businessId={businessId}
						/>
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		</TooltipProvider>
	);
}
