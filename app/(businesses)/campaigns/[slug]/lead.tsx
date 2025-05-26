import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChatMessage } from "@prisma/client";
import { Globe, Mail, MailOpen, Settings } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import type { Affiliate, AffiliateStage } from "./campaign";

export default function LeadDetailsPage({
	handleSendMessage,
	onOpenChange,
	selectedAffiliate,
	affiliateStage,
	relevantMessages,
	outreachEnabled,
	isSendingMessage,
	cooldown,
	formatCooldown,
	handleRunModeHandler,
	isUpdatingRunMode,
}: {
	handleSendMessage: () => void;
	onOpenChange: (open: boolean) => void;
	selectedAffiliate: Affiliate | null;
	affiliateStage: AffiliateStage;
	relevantMessages: ChatMessage[];
	outreachEnabled: boolean;
	isSendingMessage: boolean;
	cooldown: number;
	formatCooldown: (ms: number) => string;
	handleRunModeHandler: () => void;
	isUpdatingRunMode: boolean;
}) {
	const [automateMode, setAutomateMode] = useState<"Manual" | "Auto">("Manual");

	const lead = useMemo(
		() =>
			selectedAffiliate
				? {
						name:
							selectedAffiliate.displayName || selectedAffiliate.email || "-",
						email: selectedAffiliate.email || selectedAffiliate.handle || "-",
						handle: selectedAffiliate.handle || "-",
						status: selectedAffiliate.status || "-",
						type: selectedAffiliate.platform || "-",
						id: selectedAffiliate.handle || "-",
						avatar: selectedAffiliate.avatar || null,
						tag: selectedAffiliate.tag || "-",
						reason: selectedAffiliate.reason || "-",
					}
				: null,
		[selectedAffiliate],
	);

	const salesStages = [
		{ key: "warm_up", label: "Warm Up" },
		{ key: "engaged", label: "Engaged" },
		{ key: "negotiating", label: "Negotiating" },
		{ key: "ready", label: "Ready" },
		{ key: "inactive", label: "Inactive" },
	];
	const currentStage = salesStages.findIndex(
		(s) => s.key === affiliateStage.stage,
	);

	// AffiliateStageButtonConfig copied from campaign.tsx
	const affiliateStageButtonConfig = {
		warm_up: {
			color: "bg-blue-500 hover:bg-blue-600 text-white",
			message:
				"Awesome! We're starting to build a relationship with this creator. We'll engage with their posts over the next few days and update you when it's time to reach out!",
			label: "Send warm up message",
			status: "Warm up message sent",
		},
		engaged: {
			color: "bg-yellow-500 hover:bg-yellow-600 text-white",
			message:
				"Great! This creator is actively engaging with us. Keep the conversation going and look for opportunities to collaborate.",
			label: "Send engaged message",
			status: "Engaged message sent",
		},
		negotiating: {
			color: "bg-orange-500 hover:bg-orange-600 text-white",
			message:
				"We're negotiating terms with this creator. Stay tuned for updates on the partnership details.",
			label: "Send negotiating message",
			status: "Negotiating message sent",
		},
		ready: {
			color: "bg-green-500 hover:bg-green-600 text-white",
			message:
				"This creator is ready to collaborate! Let's finalize the details and launch the campaign together.",
			label: "Send ready to collaborate message",
			status: "Ready to collaborate message sent",
		},
		inactive: {
			color: "bg-gray-400 text-white cursor-not-allowed",
			message:
				"This creator is currently inactive. You can revisit this relationship later or choose another affiliate.",
			label: "Inactive",
			status: "Inactive",
		},
	};

	return (
		<div className="container mx-auto px-2 py-6 md:px-6 lg:px-8 max-w-6xl">
			{/* Header */}
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
				<div className="flex items-center gap-2">
					<h1 className="text-2xl font-bold">Lead Details</h1>
				</div>
				<div className="flex gap-2 mt-2 md:mt-0">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
				</div>
			</div>

			{/* Lead Card */}
			<Card className="mb-6">
				<CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
					<div className="flex items-center gap-4">
						<Avatar className="size-16 text-xl">
							{lead?.avatar ? (
								<Image
									src={lead.avatar}
									alt={lead.name}
									width={64}
									height={64}
								/>
							) : (
								<AvatarFallback>{lead?.name.slice(0, 2)}</AvatarFallback>
							)}
						</Avatar>
						<div>
							<div className="flex items-center gap-2">
								<h2 className="text-lg font-semibold leading-tight flex items-center gap-2">
									{lead?.name}
									<span className="ml-2 text-xs font-normal text-muted-foreground">
										({automateMode})
									</span>
								</h2>
								<Badge className="ml-2" variant="secondary">
									{lead?.status}
								</Badge>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 p-0 ml-1"
										>
											<Settings className="size-4" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-56">
										<div className="space-y-4">
											<div className="space-y-2 text-sm text-muted-foreground">
												<div className="font-medium text-gray-900">
													Chat Mode
												</div>
												<RadioGroup
													defaultValue={automateMode}
													onValueChange={(value) =>
														setAutomateMode(value as "Manual" | "Auto")
													}
												>
													<div className="flex items-center space-x-2">
														<RadioGroupItem value="Manual" id="Manual" />
														<label htmlFor="Manual">Manual</label>
													</div>
													<div className="flex items-center space-x-2">
														<RadioGroupItem
															value="Auto"
															id="Auto"
															disabled={!outreachEnabled}
														/>
														<label htmlFor="Auto">Automatic</label>
													</div>
												</RadioGroup>
											</div>
											<Button
												size="sm"
												className="w-full"
												onClick={async () => {
													handleRunModeHandler();
												}}
												disabled={isUpdatingRunMode || !outreachEnabled}
											>
												{isUpdatingRunMode ? (
													<span className="w-4 h-4 animate-spin border-2 border-white rounded-full border-t-transparent mx-auto inline-block" />
												) : (
													"Save"
												)}
											</Button>
										</div>
									</PopoverContent>
								</Popover>
							</div>
							<div className="text-muted-foreground text-sm">
								{/* Company and location are not available on Affiliate, so omit */}
							</div>
							<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
								<Globe className="size-4" /> {lead?.email}
								{/* Omit location and created */}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="overview" className="mb-6">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
				</TabsList>
				<TabsContent value="overview">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
						{/* Main Content */}
						<div className="lg:col-span-2 flex flex-col gap-6">
							{/* Sales Stages */}
							<Card>
								<CardHeader>
									<CardTitle>Sales Stages</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between gap-2">
										{salesStages.map((stage, i) => (
											<div
												key={stage.key}
												className="flex flex-col items-center flex-1"
											>
												<div
													className={`rounded-full border-2 w-8 h-8 flex items-center justify-center text-xs font-semibold ${
														i <= currentStage
															? "bg-blue-500 text-white border-blue-500"
															: "bg-blue-100 text-blue-400 border-blue-100"
													}`}
												>
													{i + 1}
												</div>
												<span
													className={`mt-1 text-xs ${i === currentStage ? "font-bold text-blue-600" : "text-blue-400"}`}
												>
													{stage.label}
												</span>
											</div>
										))}
									</div>
									<div className="relative w-full h-2 mt-4 bg-blue-100 rounded-full overflow-hidden">
										<div
											className="absolute left-0 top-0 h-full bg-blue-400 transition-all duration-300"
											style={{
												width: `${((currentStage + 1) / salesStages.length) * 100}%`,
											}}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Opportunity Details */}
							<Card>
								<CardHeader>
									<CardTitle>Opportunity Details</CardTitle>
								</CardHeader>
								<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{lead && (
										<>
											<div>
												<div className="text-xs text-muted-foreground mb-1">
													Tag
												</div>
												<div className="text-sm ">{lead.tag}</div>
											</div>
											<div>
												<div className="text-xs text-muted-foreground mb-1">
													Reason
												</div>
												<div className="text-sm">{lead.reason}</div>
											</div>
										</>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="flex flex-col gap-6">
							{/* Recent Activity */}
							<Card>
								<CardHeader>
									<CardTitle>Recent Activity</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-col gap-3">
									<ScrollArea className="max-h-64">
										{relevantMessages && relevantMessages.length > 0 ? (
											<Accordion type="single" collapsible className="w-full">
												{relevantMessages.map((msg, idx) => (
													<AccordionItem
														key={msg.id || idx}
														value={(msg.id || idx).toString()}
														className="cursor-pointer"
													>
														<AccordionTrigger className="hover:no-underline focus:no-underline">
															<span className="no-underline">
																{msg.text.length > 30
																	? `${msg.text.slice(0, 30)}...`
																	: msg.text}
															</span>
														</AccordionTrigger>
														<AccordionContent>
															<div className="text-sm mb-1">{msg.text}</div>
															<div className="text-xs text-muted-foreground">
																{msg.created_at
																	? new Date(msg.created_at).toLocaleString()
																	: "-"}
															</div>
														</AccordionContent>
													</AccordionItem>
												))}
											</Accordion>
										) : (
											<div className="text-muted-foreground text-sm">
												No activity yet.
											</div>
										)}
									</ScrollArea>
								</CardContent>
							</Card>

							{/* Quick Actions */}
							<Card>
								<CardHeader>
									<CardTitle>Quick Actions</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-col gap-2">
									{automateMode === "Manual" && (
										<Button
											type="button"
											className={`rounded-lg px-4 py-1 text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 ${affiliateStageButtonConfig[affiliateStage.stage].color}`}
											onClick={handleSendMessage}
											disabled={
												affiliateStage.stage === "inactive" ||
												isSendingMessage ||
												cooldown > 0
											}
										>
											{isSendingMessage ? (
												<span className="w-4 h-4 animate-spin border-2 border-white rounded-full border-t-transparent mr-2" />
											) : (
												<MailOpen className="w-4 h-4 animate-pulse mr-2" />
											)}
											{cooldown > 0
												? `Wait ${formatCooldown(cooldown)}`
												: affiliateStageButtonConfig[affiliateStage.stage]
														.label}
										</Button>
									)}
									<div className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 w-full shadow-sm transition-all duration-300 ease-in-out flex flex-col gap-2 items-start">
										{automateMode === "Auto" && relevantMessages.length > 0 && (
											<div className="flex items-center gap-2 text-sm">
												<div
													className={`animate-pulse w-2 h-2 rounded-full ${affiliateStageButtonConfig[affiliateStage.stage].color.replace("bg-", "bg-")}`}
												/>
												<span className="font-medium text-muted-foreground">
													{
														affiliateStageButtonConfig[affiliateStage.stage]
															.status
													}
												</span>
											</div>
										)}
										{relevantMessages.length === 0 ? (
											<span className="flex items-center gap-2 text-gray-400">
												<Mail className="w-4 h-4 flex-shrink-0" />
												<span className="font-medium">Not initiated</span>
											</span>
										) : (
											<span className="relative block text-gray-700 min-h-[1.5rem]">
												<Mail className="w-4 h-4 absolute left-0 top-0" />
												<span className="pl-6 block text-left w-full leading-tight">
													{
														affiliateStageButtonConfig[affiliateStage.stage]
															.message
													}
												</span>
											</span>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>
				{/* Other tabs can be filled in as needed */}
			</Tabs>
		</div>
	);
}
