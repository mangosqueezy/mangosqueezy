"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { format, parseISO } from "date-fns";
import type {
	AnalyticsCountries,
	AnalyticsReferers,
	AnalyticsTimeseries,
} from "dub/models/components";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAnalytics } from "../actions";

const chartConfig = {
	clicks: {
		label: "Clicks",
		color: "hsl(var(--chart-7))",
	},
} satisfies ChartConfig;

const countryChartConfig = {
	country: {
		label: "Country",
		color: "hsl(var(--chart-5))",
	},
	label: {
		color: "hsl(var(--label))",
	},
} satisfies ChartConfig;

const referrerChartConfig = {
	referrer: {
		label: "Referrer",
		color: "hsl(var(--chart-6))",
	},
	label: {
		color: "hsl(var(--label))",
	},
} satisfies ChartConfig;

export default function Analytics() {
	const params = useParams<{ slug: string }>();
	const [chartData, setChartData] = useState<Array<AnalyticsTimeseries>>();
	const [countryChartData, setCountryChartData] =
		useState<Array<AnalyticsCountries>>();
	const [referrerChartData, setReferrerChartData] =
		useState<Array<AnalyticsReferers>>();

	const getLinkAnalytics = useCallback(async () => {
		const formData = new FormData();
		formData.append("linkId", params.slug);
		const analytics = await getAnalytics(formData);
		const { clickTimeseries, countryTimeseries, referrerTimeseries } =
			analytics || {};

		const metricList: Array<AnalyticsTimeseries> = [];
		if (clickTimeseries) {
			for (const metric of clickTimeseries) {
				const date = parseISO(metric.start);
				const month = format(date, "MMMM");
				metricList.push({ start: month, clicks: metric.clicks });
			}
		}

		setChartData(metricList);
		// only top 5 for now
		setCountryChartData(countryTimeseries?.slice(0, 5));
		setReferrerChartData(referrerTimeseries?.slice(0, 5));
	}, [params.slug]);

	useEffect(() => {
		getLinkAnalytics();
	}, [getLinkAnalytics]);

	return (
		<div>
			<div className="mx-auto grid max-w-screen-xl gap-5 px-2.5 lg:px-20">
				<div>
					<Button asChild variant="ghost">
						<Link href="/metrics">
							<ChevronLeft className="w-4 h-4" />
							Back to Metrics
						</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>
							<div className="flex items-center gap-2">
								<span className="font-semibold">Clicks</span>
								<span className="text-sm text-muted-foreground">1 Year</span>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer config={chartConfig} className="w-full h-80">
							<AreaChart
								accessibilityLayer
								data={chartData}
								margin={{
									left: 12,
									right: 12,
								}}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="start"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(value) => value.slice(0, 3)}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Area
									dataKey="clicks"
									type="natural"
									fill="var(--color-clicks)"
									fillOpacity={0.4}
									stroke="var(--color-clicks)"
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>
				<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
					<div className="flex flex-col gap-2">
						<Card>
							<CardHeader>
								<CardTitle>
									<div className="flex items-center gap-2">
										<span className="font-semibold text-lg">Countries</span>
										<span className="text-sm text-muted-foreground">
											Top 5 Only
										</span>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ChartContainer
									config={countryChartConfig}
									className="w-full h-80"
								>
									<BarChart
										accessibilityLayer
										data={countryChartData}
										layout="vertical"
										className="w-full h-full"
										margin={{
											right: 16,
										}}
									>
										<CartesianGrid horizontal={false} />
										<YAxis
											dataKey="country"
											type="category"
											tickLine={false}
											tickMargin={10}
											axisLine={false}
											tickFormatter={(value) => value.slice(0, 3)}
											hide
										/>
										<XAxis dataKey="clicks" type="number" hide />
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent indicator="line" />}
										/>
										<Bar
											dataKey="clicks"
											layout="vertical"
											fill="var(--color-country)"
											radius={4}
											className="h-20"
										>
											<LabelList
												dataKey="country"
												position="insideLeft"
												offset={8}
												className="fill-[--color-label]"
												fontSize={12}
											/>
										</Bar>
									</BarChart>
								</ChartContainer>
							</CardContent>
						</Card>
					</div>

					<div className="flex flex-col gap-2">
						<Card>
							<CardHeader>
								<CardTitle>
									<div className="flex items-center gap-2">
										<span className="font-semibold text-lg">Referrers</span>
										<span className="text-sm text-muted-foreground">
											Top 5 Only
										</span>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ChartContainer
									config={referrerChartConfig}
									className="w-full h-80"
								>
									<BarChart
										accessibilityLayer
										data={referrerChartData}
										layout="vertical"
										className="w-full h-full"
										margin={{
											right: 16,
										}}
									>
										<CartesianGrid horizontal={false} />
										<YAxis
											dataKey="referer"
											type="category"
											tickLine={false}
											tickMargin={10}
											axisLine={false}
											tickFormatter={(value) => value.slice(0, 3)}
											hide
										/>
										<XAxis dataKey="clicks" type="number" hide />
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent indicator="line" />}
										/>
										<Bar
											dataKey="clicks"
											layout="vertical"
											fill="var(--color-referrer)"
											radius={4}
											className="h-20"
										>
											<LabelList
												dataKey="referer"
												position="insideLeft"
												offset={8}
												className="fill-[--color-label]"
												fontSize={12}
											/>
										</Bar>
									</BarChart>
								</ChartContainer>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
