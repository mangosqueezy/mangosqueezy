"use server";
import { Dub } from "dub";
import type {
	ClicksCountries,
	ClicksReferers,
	ClicksTimeseries,
} from "dub/models/components";

const dub = new Dub({
	token: process.env.DUBCO_API_KEY,
});

export async function getAnalytics(body: FormData) {
	const linkId = body.get("linkId") as string;

	try {
		// Retrieve the timeseries analytics for the last 7 days for a link
		const clickEvent = await dub.analytics.retrieve({
			linkId: linkId,
			interval: "1y",
			groupBy: "timeseries",
		});

		const countryEvent = await dub.analytics.retrieve({
			linkId: linkId,
			interval: "1y",
			groupBy: "countries",
		});

		const referrerEvent = await dub.analytics.retrieve({
			linkId: linkId,
			interval: "1y",
			groupBy: "referers",
		});

		const clickTimeseries = clickEvent as ClicksTimeseries[];
		const countryTimeseries = countryEvent as ClicksCountries[];
		const referrerTimeseries = referrerEvent as ClicksReferers[];

		return { clickTimeseries, countryTimeseries, referrerTimeseries };
	} catch (error) {
		console.error("Error fetching analytics: ", error);
		return null;
	}
}
