import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	turbopack: {},
	experimental: {
		serverActions: {
			bodySizeLimit: "5mb",
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.ytimg.com",
			},
			{
				protocol: "https",
				hostname: "yt3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "yt3.ggpht.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "lkjqkobxmgqedqtidcws.supabase.co",
			},
			{
				protocol: "https",
				hostname: "xumm.app",
			},
			{
				protocol: "https",
				hostname: "youtu.be",
			},
			{
				protocol: "https",
				hostname: "cdn.bsky.app",
			},
			{
				protocol: "https",
				hostname: "scontent-ord5-2.xx.fbcdn.net",
			},
			{
				protocol: "https",
				hostname: "scontent-yyz1-1.cdninstagram.com",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/_proxy/squzy/track/:path",
				destination: "https://api.squzy.link/track/:path",
			},
			{
				source: "/_proxy/squzy/script.js",
				destination:
					"https://pub-de4924ae66c74c129209cb58768d12fb.r2.dev/script.js",
			},
		];
	},
};

export default withSentryConfig(nextConfig, {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	org: "tapasom",
	project: "javascript-nextjs",

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	// tunnelRoute: "/monitoring",

	// Hides source maps from generated client bundles
	hideSourceMaps: true,

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true,
});
