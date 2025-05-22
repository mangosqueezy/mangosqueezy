"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ReferralBanner() {
	const [partnerData, setPartnerData] = useState<null | {
		partner: { name: string; image: string };
		discount: { amount: string; type: string };
	}>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		let tries = 0;
		const maxTries = 10;

		const interval = setInterval(() => {
			const data = Cookies.get("dub_partner_data");
			if (data) {
				try {
					const parsed = JSON.parse(data);
					setPartnerData(parsed);
					setOpen(true);
					clearInterval(interval);
				} catch (err) {
					console.error("Cookie parse failed:", err);
					clearInterval(interval);
				}
			}
			if (++tries >= maxTries) {
				clearInterval(interval);
			}
		}, 500); // check every 500ms, max 5 seconds

		return () => clearInterval(interval);
	}, []);

	if (!partnerData) return null;

	const { partner, discount } = partnerData;

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="text-center">
						You've been referred!
					</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="flex flex-col items-center justify-center gap-4">
							<Image
								src={partner.image}
								alt={partner.name}
								width={64}
								height={64}
								className="rounded-full"
							/>
							<p className="text-center mt-2">
								{partner.name} referred you to mangosqueezy and gave you{" "}
								{discount.amount} {discount.type} off
							</p>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogAction asChild>
					<div className="flex justify-center w-full">
						<Button onClick={() => setOpen(false)}>View</Button>
					</div>
				</AlertDialogAction>
			</AlertDialogContent>
		</AlertDialog>
	);
}
