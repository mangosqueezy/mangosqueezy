"use client";

import { useCallback, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, Bar, BarChart, LabelList, YAxis } from "recharts";

import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getAnalytics } from "../actions";
import { parseISO, format } from "date-fns";
import { ClicksTimeseries, ClicksCountries } from "dub/models/components";

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const countryChartConfig = {
  country: {
    label: "Country",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export default function Analytics() {
  const params = useParams<{ slug: string }>();
  const [chartData, setChartData] = useState<Array<ClicksTimeseries>>();
  const [countryChartData, setCountryChartData] = useState<Array<ClicksCountries>>();

  const getLinkAnalytics = useCallback(async () => {
    const formData = new FormData();
    formData.append("linkId", params.slug);
    const analytics = await getAnalytics(formData);
    const { clickTimeseries, countryTimeseries } = analytics || {};

    let metricList: Array<ClicksTimeseries> = [];
    clickTimeseries?.forEach(metric => {
      const date = parseISO(metric.start);
      const month = format(date, "MMMM");
      metricList.push({ start: month, clicks: metric.clicks });
    });
    setChartData(metricList);
    // only top 5 for now
    setCountryChartData(countryTimeseries?.slice(0, 5));
  }, [params.slug]);

  useEffect(() => {
    getLinkAnalytics();
  }, [params.slug, getLinkAnalytics]);

  return (
    <>
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
                tickFormatter={value => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
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

      <Card>
        <CardHeader>
          <CardTitle>Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={countryChartConfig} className="w-full h-80">
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
                tickFormatter={value => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey="clicks" type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
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
                <LabelList
                  dataKey="clicks"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
