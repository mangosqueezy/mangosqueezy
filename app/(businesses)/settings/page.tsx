"use client";
import stripeLogo from "@/assets/stripe.png";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Business, Products } from "@prisma/client";
import { Copy, CreditCard, Mail, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getUser } from "../actions";
import { createShortLink } from "./actions";

export default function Settings() {
	const router = useRouter();
	const [loggedInUser, setLoggedInUser] = useState<
		(Business & { products: Products[] }) | undefined | null
	>(null);
	const [copyStatus, setCopyStatus] = useState<string>("");
	const [shortLink, setShortLink] = useState<string>("");

	const getLoggedInUser = useCallback(async () => {
		const user = await getUser();
		setLoggedInUser(user);
	}, []);

	useEffect(() => {
		getLoggedInUser();
	}, [getLoggedInUser]);

	const createShortLinkHandler = useCallback(async (userId: string) => {
		const shortLink = await createShortLink(
			userId,
			`https://www.mangosqueezy.com/connectify/${userId}`,
		);
		setShortLink(shortLink);
	}, []);

	useEffect(() => {
		if (
			loggedInUser?.id &&
			loggedInUser?.products &&
			loggedInUser.products.length > 0 &&
			loggedInUser?.connectify_short_link === null
		) {
			createShortLinkHandler(loggedInUser?.id as string);
		}
	}, [loggedInUser, createShortLinkHandler]);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopyStatus("Link copied to clipboard!");
			setTimeout(() => setCopyStatus(""), 2000);
		} catch (err) {
			setCopyStatus("Failed to copy link");
			setTimeout(() => setCopyStatus(""), 2000);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<div className="space-y-6">
				{/* Profile Section */}
				<div>
					<h2 className="text-2xl font-semibold tracking-tight mb-6">
						Settings
					</h2>
					<Card className="border border-orange-200 bg-orange-20">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Mail className="h-5 w-5 text-muted-foreground" />
								<CardTitle>Profile Information</CardTitle>
							</div>
							<CardDescription>
								Manage your account settings and email preferences
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<Label htmlFor="email" className="text-sm font-medium">
										Email Address
									</Label>
									<div className="mt-1">
										<Input
											disabled
											type="email"
											value={loggedInUser?.email || ""}
											id="email"
											className="bg-muted cursor-not-allowed"
										/>
									</div>
									<p className="mt-1 text-sm text-muted-foreground">
										This is the email associated with your account
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Affiliate Section */}
				<div>
					<Card className="border border-orange-200 bg-orange-20">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Share2 className="h-5 w-5 text-muted-foreground" />
								<CardTitle>Affiliate Invitation</CardTitle>
							</div>
							<CardDescription>
								Share this link with potential affiliates to promote your
								products
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loggedInUser?.products && loggedInUser.products.length > 0 ? (
								<div className="space-y-4">
									<div>
										<Label className="text-sm font-medium">
											Your Affiliate Invitation Link
										</Label>
										<div className="mt-2 flex gap-2">
											<div className="relative flex-1">
												<Input
													readOnly
													value={
														loggedInUser?.connectify_short_link || shortLink
													}
													className="pr-24 font-mono text-sm bg-muted"
												/>
											</div>
											<Button
												variant="secondary"
												size="default"
												onClick={() =>
													copyToClipboard(
														loggedInUser?.connectify_short_link || shortLink,
													)
												}
												className="shrink-0 flex items-center gap-2"
											>
												<Copy className="h-4 w-4" />
												Copy
											</Button>
										</div>
										{copyStatus && (
											<p
												className={`mt-2 text-sm ${
													copyStatus.includes("Failed")
														? "text-destructive"
														: "text-green-600"
												}`}
											>
												{copyStatus}
											</p>
										)}
										<p className="mt-3 text-sm text-muted-foreground">
											Share this link with potential affiliates. They can use it
											to sign up and start promoting your products.
										</p>
									</div>
								</div>
							) : (
								<div className="py-4 text-center">
									<p className="text-sm text-muted-foreground">
										Add a product first to get your affiliate invitation link
									</p>
									<Button
										variant="outline"
										className="mt-4"
										onClick={() => router.push("/products")}
									>
										Add Your First Product
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Connect Apps Section */}
				<div>
					<Card className="border border-orange-200 bg-orange-20">
						<CardHeader>
							<div className="flex items-center gap-2">
								<CreditCard className="size-5 text-muted-foreground" />
								<CardTitle>Connect Apps</CardTitle>
							</div>
							<CardDescription>
								Connect third-party apps to enhance your business capabilities.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between p-4 border rounded bg-white">
									<div className="flex items-center gap-3">
										<Image
											src={stripeLogo.src}
											alt="Stripe"
											width={100}
											height={100}
										/>
									</div>
									{loggedInUser?.stripe_connected_account !== null &&
									loggedInUser?.stripe_connected_account !== undefined ? (
										<p>Connected</p>
									) : (
										<Link
											className="border bg-blue-500 text-white px-4 py-2 rounded-md text-center"
											href="https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_SIlYUYnEmJy1CaNTUa7mUFKyXLEFLN1C&scope=read_write"
										>
											Connect
										</Link>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
