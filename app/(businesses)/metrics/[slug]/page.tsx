"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { format, parseISO } from "date-fns";
import type {
	ClicksCountries,
	ClicksReferers,
	ClicksTimeseries,
} from "dub/models/components";
import { useParams } from "next/navigation";
import { getAnalytics } from "../actions";

const chartConfig = {
	clicks: {
		label: "Clicks",
		color: "hsl(var(--chart-4))",
	},
} satisfies ChartConfig;

const countryChartConfig = {
	country: {
		label: "Country",
		color: "hsl(var(--chart-3))",
	},
	label: {
		color: "hsl(var(--background))",
	},
} satisfies ChartConfig;

const referrerChartConfig = {
	referrer: {
		label: "Referrer",
		color: "hsl(var(--chart-2))",
	},
	label: {
		color: "hsl(var(--background))",
	},
} satisfies ChartConfig;

export default function Analytics() {
	const params = useParams<{ slug: string }>();
	const [chartData, setChartData] = useState<Array<ClicksTimeseries>>();
	const [countryChartData, setCountryChartData] =
		useState<Array<ClicksCountries>>();
	const [referrerChartData, setReferrerChartData] =
		useState<Array<ClicksReferers>>();

	const getLinkAnalytics = useCallback(async () => {
		const formData = new FormData();
		formData.append("linkId", params.slug);
		const analytics = await getAnalytics(formData);
		const { clickTimeseries, countryTimeseries, referrerTimeseries } =
			analytics || {};

		const metricList: Array<ClicksTimeseries> = [];
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
		<>
			<div className="bg-gray-50 py-10 rounded-lg">
				<div className="mx-auto grid max-w-screen-xl gap-5 px-2.5 lg:px-20">
					<Card>
						<CardHeader>
							<CardTitle>Clicks</CardTitle>
						</CardHeader>
						<CardContent>
							<ChartContainer config={chartConfig} className="w-full h-80">
								<LineChart
									accessibilityLayer
									data={chartData}
									className="w-full h-full"
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
									<Line
										dataKey="clicks"
										type="linear"
										stroke="var(--color-clicks)"
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ChartContainer>
						</CardContent>
					</Card>
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
						<div className="flex flex-col gap-2">
							<Card>
								<CardHeader>
									<CardTitle>Countries</CardTitle>
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
									<CardTitle>Referrers</CardTitle>
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
		</>
	);
}
