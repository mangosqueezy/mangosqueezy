"use server";

import type {
	AnalyticsCountries,
	AnalyticsReferers,
	AnalyticsTimeseries,
} from "dub/models/components";

const SQUZY_API_KEY = process.env.SQUZY_API_KEY;

export async function getAnalytics(body: FormData) {
	const linkId = body.get("linkId") as string;

	try {
		// Retrieve the timeseries analytics for the last 7 days for a link
		const options = {
			method: "GET",
			headers: { Authorization: `Bearer ${SQUZY_API_KEY}` },
		};

		const clickResponse = await fetch(
			`https://api.squzy.link/analytics?linkId=${linkId}&interval=1y&groupBy=timeseries`,
			options,
		);
		const clickEvent = await clickResponse.json();

		const countryResponse = await fetch(
			`https://api.squzy.link/analytics?linkId=${linkId}&interval=1y&groupBy=countries`,
			options,
		);
		const countryEvent = await countryResponse.json();

		const referrerResponse = await fetch(
			`https://api.squzy.link/analytics?linkId=${linkId}&interval=1y&groupBy=referers`,
			options,
		);
		const referrerEvent = await referrerResponse.json();

		const clickTimeseries = clickEvent as AnalyticsTimeseries[];
		const countryTimeseries = countryEvent as AnalyticsCountries[];
		const referrerTimeseries = referrerEvent as AnalyticsReferers[];

		return { clickTimeseries, countryTimeseries, referrerTimeseries };
	} catch (error) {
		console.error("Error fetching analytics: ", error);
		return null;
	}
}
