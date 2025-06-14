"use client";
import { useImportCsvModal } from "@/components/mango-ui/import-csv-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn, hasFeatureAccess } from "@/lib/utils";
import { CreditCard, File, Handshake, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	useDeferredValue,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCampaignAction, getGooglePlacesAction } from "./actions";

const TYPE_OPTIONS = ["social_media", "stripe", "import_csv"] as const;

type CampaignSheetFormProps = {
	products: Array<{ id: string; name: string }>;
	type: (typeof TYPE_OPTIONS)[number];
	stripeConnectedAccountId?: string | null;
	business_id: string | null | undefined;
	pipelineCount: number;
	plan: string;
	email: string;
};

const platforms = [
	{ label: "YouTube", value: "youtube" },
	{ label: "Bluesky", value: "bluesky" },
];

type FormValues = {
	product: string;
	count: string;
	lead: string;
	click: string;
	sale: string;
	platform?: string;
	locationRadius?: string;
};

interface GooglePlaceSuggestion {
	place_id: string;
	description: string;
	geometry: { location: { lat: number; lng: number } };
}

export default function CampaignForm({
	products,
	type,
	stripeConnectedAccountId,
	business_id,
	pipelineCount,
	plan,
	email,
}: CampaignSheetFormProps) {
	const router = useRouter();
	const { setShowImportCsvModal, ImportCsvModal, setPlan, setUserId } =
		useImportCsvModal();
	const [isLoading, setIsLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [location, setLocation] = useState("");
	const deferredQuery = useDeferredValue(location);
	const [locationLoading, setLocationLoading] = useState(false);
	const [locationError, setLocationError] = useState("");
	const [selectedPlatform, setSelectedPlatform] = useState<string>("");
	const [isPending, startTransition] = useTransition();
	const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [placeId, setPlaceId] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleImportCsvModalOpenChange = (open: boolean) => {
		if (type === "import_csv") {
			setShowImportCsvModal(open);
			setPlan(plan);
			setUserId(business_id as string);
		} else {
			setOpen(open);
		}
	};

	const form = useForm<FormValues>({
		defaultValues: {
			product: "",
			count: "",
			lead: "",
			click: "",
			sale: "",
			platform: "",
			locationRadius: "100",
		},
		mode: "onBlur",
	});

	const onSubmit = async (values: FormValues) => {
		const referralLimit = hasFeatureAccess(
			plan,
			"Features",
			"Referrals",
		) as number;

		const programLimit = hasFeatureAccess(
			plan,
			"Features",
			"Programs",
		) as number;

		if (
			pipelineCount >= programLimit ||
			Number.parseInt(values.count) > referralLimit
		) {
			toast.info(
				`You have reached the maximum number of ${
					pipelineCount >= programLimit ? "affiliates programs" : "affiliates"
				}.`,
			);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		const toastId = toast.loading("We are processing your request...");

		let platform: string | undefined;
		if (type === "social_media") {
			platform = values.platform || "youtube";
		} else if (type === "stripe") {
			platform = "stripe";
		} else if (type === "import_csv") {
			platform = "import_csv";
		} else {
			platform = undefined;
		}

		const data = {
			product_id: Number.parseInt(values.product),
			business_id: business_id as string,
			count: Number.parseInt(values.count),
			lead: Number.parseInt(values.lead || "0"),
			click: Number.parseInt(values.click || "0"),
			sale: Number.parseInt(values.sale || "0"),
			platform,
			connected_account_id: stripeConnectedAccountId as string,
			placeId:
				type === "social_media" && platform === "youtube" && placeId
					? placeId
					: undefined,
			email,
			locationRadius:
				type === "social_media" && platform === "youtube"
					? `${values.locationRadius || "100"}km`
					: undefined,
		};
		const { upstashWorkflowRunId } = await createCampaignAction(data);
		router.refresh();
		setIsLoading(false);
		setOpen(false);
		toast.dismiss(toastId);
		if (upstashWorkflowRunId) {
			toast.success(
				"We are processing your request... You will receive an email when it's done.",
			);
		}
	};

	useEffect(() => {
		const searchPlaces = async () => {
			try {
				const data = await getGooglePlacesAction(deferredQuery);
				if (data.status === "OK" && data.predictions.length > 0) {
					startTransition(() => {
						setSuggestions(data.predictions as GooglePlaceSuggestion[]);
						setShowSuggestions(true);
					});
				} else {
					setSuggestions([]);
					setShowSuggestions(false);
					setLocationError("No results found");
				}
			} catch (err) {
				setSuggestions([]);
				setShowSuggestions(false);
				setLocationError("Failed to fetch suggestions");
			} finally {
				setLocationLoading(false);
			}
		};
		if (deferredQuery !== "") {
			searchPlaces();
		}
	}, [deferredQuery]);

	const handleSelectSuggestion = (suggestion: GooglePlaceSuggestion) => {
		setLocation(suggestion.description);
		setPlaceId(suggestion.place_id);
		setShowSuggestions(false);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={handleImportCsvModalOpenChange}>
				<DialogTrigger asChild>
					<Card className="w-full sm:flex-1 min-w-0 max-w-[250px] hover:shadow-md transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center gap-3">
							<span className="text-lg">
								{type === "social_media" ? (
									<Handshake className="size-10 text-white bg-yellow-500 rounded-full p-2" />
								) : type === "stripe" ? (
									<CreditCard className="size-10 text-white bg-lime-500 rounded-full p-2" />
								) : (
									<File className="size-10 text-white bg-sky-500 rounded-full p-2" />
								)}
							</span>
							<CardTitle className="text-sm text-neutral-800">
								{type === "social_media"
									? "Find and enrich affiliates"
									: type === "stripe"
										? "Enrich Stripe customer"
										: "Import CSV"}
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0 text-gray-600 text-sm">
							{type === "social_media"
								? "Discover and enhance affiliate profiles to grow your network and boost your campaigns."
								: type === "stripe"
									? "Enhance your Stripe customer data for better insights and personalized engagement."
									: "Easily import your campaigns into mangosqueezy with just a few clicks."}
						</CardContent>
					</Card>
				</DialogTrigger>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{type === "social_media"
								? "Find and Enrich Affiliates"
								: type === "stripe"
									? "Enrich your Stripe Customer"
									: "Import CSV to create campaigns"}
						</DialogTitle>
					</DialogHeader>
					{type === "stripe" && !stripeConnectedAccountId ? (
						<Link
							className="border bg-blue-500 text-white px-4 py-2 rounded-md text-center"
							href="/settings"
						>
							Go to Settings page to connect your Stripe account
						</Link>
					) : (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="product"
									rules={{ required: "Product is required" }}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Product</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}
													defaultValue=""
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a product" />
													</SelectTrigger>
													<SelectContent>
														{products?.map((p) => (
															<SelectItem key={p.id} value={p.id}>
																{p.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="count"
									rules={{
										required: "Affiliates count is required",
										min: { value: 1, message: "Must be at least 1" },
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Number of Affiliates</FormLabel>
											<FormControl>
												<Input type="number" min={1} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lead"
									rules={{
										min: { value: 0, message: "Must be at least 0" },
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Lead reward in USD</FormLabel>
											<FormDescription className="text-xs text-muted-foreground">
												Optional: This is the reward for each lead.
											</FormDescription>
											<FormControl>
												<Input type="number" min={0} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="click"
									rules={{
										min: { value: 0, message: "Must be at least 0" },
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Click reward in USD</FormLabel>
											<FormDescription className="text-xs text-muted-foreground">
												Optional: This is the reward for each click.
											</FormDescription>
											<FormControl>
												<Input type="number" min={0} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="sale"
									rules={{
										min: { value: 0, message: "Must be at least 0" },
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sale reward in USD</FormLabel>
											<FormDescription className="text-xs text-muted-foreground">
												Optional: This is the reward for each sale.
											</FormDescription>
											<FormControl>
												<Input type="number" min={0} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{type === "social_media" && (
									<FormField
										control={form.control}
										name="platform"
										rules={{}}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Social Media Platform</FormLabel>
												<FormControl>
													<Select
														value={field.value}
														onValueChange={(val) => {
															field.onChange(val);
															setSelectedPlatform(val);
														}}
														defaultValue=""
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select a platform" />
														</SelectTrigger>
														<SelectContent>
															{platforms.map((p) => (
																<SelectItem key={p.value} value={p.value}>
																	{p.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
								{type === "social_media" && selectedPlatform === "youtube" && (
									<>
										<FormItem className="relative">
											<FormLabel>Location</FormLabel>
											<FormControl>
												<div>
													<Input
														ref={inputRef}
														placeholder="Enter a location (city, address, etc.)"
														value={location}
														onChange={(e) => {
															const value = e.target.value;
															setLocation(value);
															setLocationError("");
														}}
														autoComplete="off"
													/>
													{showSuggestions && suggestions.length > 0 && (
														<ul className="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded shadow max-h-48 overflow-auto">
															{suggestions.map((s, idx) => (
																<li
																	key={s.place_id || idx}
																	className="px-0 py-0 text-sm text-neutral-800"
																>
																	<button
																		type="button"
																		className="w-full text-left px-3 py-2 cursor-pointer hover:bg-gray-100"
																		onClick={() => handleSelectSuggestion(s)}
																		onKeyDown={(e) => {
																			if (e.key === "Enter" || e.key === " ") {
																				e.preventDefault();
																				handleSelectSuggestion(s);
																			}
																		}}
																	>
																		{s.description}
																	</button>
																</li>
															))}
														</ul>
													)}
												</div>
											</FormControl>
											{(locationLoading || isPending) && (
												<div className="text-xs text-gray-500">
													Fetching suggestions...
												</div>
											)}
											{locationError && (
												<div className="text-xs text-red-500">
													{locationError}
												</div>
											)}
										</FormItem>
										<FormField
											control={form.control}
											name="locationRadius"
											rules={{
												min: { value: 1, message: "Must be at least 1km" },
											}}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Location Radius (km)</FormLabel>
													<FormControl>
														<Input
															type="number"
															min={1}
															{...field}
															placeholder="Enter radius in kilometers"
														/>
													</FormControl>
													<FormDescription className="text-xs text-muted-foreground">
														Specify the radius (in kilometers) around the
														selected location to capture affiliates.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								)}
								<Button
									type="submit"
									className={cn(
										type === "social_media"
											? "bg-yellow-400 hover:bg-yellow-600"
											: "bg-lime-300 hover:bg-lime-600",
										"w-full font-bold text-muted-foreground hover:text-white",
									)}
									disabled={isLoading}
								>
									{isLoading ? (
										<span className="flex items-center justify-center text-muted-foreground">
											<Loader className="size-4 mr-2 animate-spin" />
											Submitting...
										</span>
									) : (
										"Submit"
									)}
								</Button>
							</form>
						</Form>
					)}
				</DialogContent>
			</Dialog>

			{type === "import_csv" && <ImportCsvModal />}
		</>
	);
}
