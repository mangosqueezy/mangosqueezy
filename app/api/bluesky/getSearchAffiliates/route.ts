import { NextResponse } from "next/server";
import { evalAi } from "./evalAi";
import { getKeywords } from "./getKeywords";

type Follower = {
	did: string;
	handle: string;
	displayName: string;
	avatar: string;
	labels: string[];
	createdAt: string;
	indexedAt: string;
};

type ExternalEmbed = {
	uri: string;
	title: string;
	description: string;
	thumb: string;
};

type EmbedView = {
	$type: string;
	external: ExternalEmbed;
};

type RecordFacetFeature = {
	$type: string;
	tag: string;
};

type RecordFacet = {
	features: RecordFacetFeature[];
	index: {
		byteEnd: number;
		byteStart: number;
	};
};

type PostRecord = {
	$type: string;
	createdAt: string;
	embed: {
		$type: string;
		external: {
			description: string;
			thumb: {
				$type: string;
				ref: {
					$link: string;
				};
				mimeType: string;
				size: number;
			};
			title: string;
			uri: string;
		};
	};
	facets: RecordFacet[];
	langs: string[];
	text: string;
};

type Post = {
	uri: string;
	cid: string;
	author: {
		did: string;
		handle: string;
		displayName: string;
		avatar: string;
		labels: string[];
		createdAt: string;
	};
	record: PostRecord;
	embed: EmbedView;
	replyCount: number;
	repostCount: number;
	likeCount: number;
	quoteCount: number;
	indexedAt: string;
	labels: string[];
};

type Feed = {
	feed: {
		post: Post;
	}[];
};

type PostMetrics = {
	replyCount: number;
	repostCount: number;
	likeCount: number;
	quoteCount: number;
};

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const limit: string = searchParams.get("limit") || "30";
		const description: string = searchParams.get("description") || "";

		const followers: Follower[] = [];

		const { keywords: searchKeywords } = await getKeywords({
			description,
		});

		for (const keyword of searchKeywords) {
			const followersResponse = await fetch(
				`https://public.api.bsky.app/xrpc/app.bsky.actor.searchActors?q=${keyword}&limit=${limit}`,
			);

			const { actors } = await followersResponse.json();
			followers.push(...actors);
		}

		const postMetricsMap = new Map();

		try {
			const authorFeedResponses = await Promise.allSettled(
				followers.map((follower: Follower) =>
					fetch(
						`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${follower.handle}&filter=posts_no_replies&includePins=true&limit=3`,
					),
				),
			);

			const authorFeeds = (
				await Promise.allSettled(
					authorFeedResponses
						.filter((response) => response.status === "fulfilled")
						.map((response) =>
							(response as PromiseFulfilledResult<Response>).value.json(),
						),
				)
			)
				.filter((result) => result.status === "fulfilled")
				.map((result) => (result as PromiseFulfilledResult<Feed>).value);

			authorFeeds.forEach((feed: Feed, index: number) => {
				const handle = followers[index].handle;
				const metrics: Record<string, PostMetrics> = {};

				for (const post of feed.feed || []) {
					metrics[post.post.uri] = {
						replyCount: post.post.replyCount,
						repostCount: post.post.repostCount,
						likeCount: post.post.likeCount,
						quoteCount: post.post.quoteCount,
					};
				}

				postMetricsMap.set(handle, metrics);
			});
		} catch (error) {
			console.error("error", error);
		}

		const authorFeedsWithMetrics = Object.fromEntries(postMetricsMap);

		const evaluationResults = await Promise.all(
			Object.entries(authorFeedsWithMetrics).map(
				async ([handle, postMetrics]) => {
					const result = await evalAi({
						handle,
						postMetrics: postMetrics as PostMetrics | undefined,
					});
					return {
						handle,
						...result,
					};
				},
			),
		);

		const filteredEvaluationResults = evaluationResults.filter(
			(result) => result.evaluation === "Yes",
		);

		return NextResponse.json(filteredEvaluationResults, { status: 200 });
	} catch (_) {
		return NextResponse.json(
			{ error: "something went wrong" },
			{ status: 400 },
		);
	}
}
