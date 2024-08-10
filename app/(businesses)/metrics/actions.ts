"use server";
import { Dub } from "dub";
import { ClicksTimeseries } from "dub/models/components";

const dub = new Dub({
  token: process.env.DUBCO_API_KEY,
});

export async function getAnalytics(body: FormData) {
  const linkId = body.get("linkId") as string;

  try {
    // Retrieve the timeseries analytics for the last 7 days for a link
    const response = await dub.analytics.retrieve({
      linkId: linkId,
    });

    const timeseries = response as ClicksTimeseries[];

    return timeseries;
  } catch (error) {
    console.error("Error fetching analytics: ", error);
    return null;
  }
}
