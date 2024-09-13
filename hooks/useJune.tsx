import { AnalyticsBrowser } from "@june-so/analytics-next";
import { useEffect, useState } from "react";

export function useJune(writeKey: string) {
	const [analytics, setAnalytics] = useState<AnalyticsBrowser | undefined>(
		undefined,
	);

	useEffect(() => {
		const loadAnalytics = async () => {
			const response = AnalyticsBrowser.load({
				writeKey,
			});
			setAnalytics(response);
		};
		loadAnalytics();
	}, [writeKey]);

	return analytics;
}
