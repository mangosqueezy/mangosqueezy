import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { z } from "zod";

type PostMetrics = {
	replyCount: number;
	repostCount: number;
	likeCount: number;
	quoteCount: number;
};

export type Difficulty = "easy" | "medium" | "hard";

type EvalAiProps = {
	handle: string;
	postMetrics?: PostMetrics | undefined;
	difficulty?: Difficulty;
};

export async function evalAi({
	handle,
	postMetrics,
	difficulty = "hard",
}: EvalAiProps) {
	const evaluationSchema = z.object({
		evaluation: z.enum(["Yes", "No"]),
		tag: z.enum([
			"MicroInfluencer",
			"NanoInfluencer",
			"MidTierInfluencer",
			"MacroInfluencer",
			"MegaInfluencer",
		]),
		reason: z.string(),
	});

	try {
		const subscriberCount = postMetrics?.likeCount || 0;
		const viewCount = postMetrics?.quoteCount || 0;
		const avgViewsPerVideo = viewCount / 1082; // Using average video count from sample

		const { experimental_output } = await generateText({
			model: openai("gpt-4o-mini", { structuredOutputs: true }),
			prompt: `
				You are an expert in YouTube channel evaluation and influencer marketing. Please evaluate the following YouTube channel data and assess whether it would be a good fit for a brand partnership.
				Be ${difficulty} in your evaluation but don't mark it as 'Yes' if it's not suitable. If you believe the channel has potential, mark it as 'Yes' and provide a reason along with relevant tags.

				Channel Handle: ${handle}
				Subscriber Count: ${subscriberCount}
				Total View Count: ${viewCount}
				Average Views Per Video: ${avgViewsPerVideo.toFixed(0)}

				Here is the YouTube influencer reference guide for evaluation:
				
				Micro Influencers (1,000 - 10,000 subscribers):
				- High engagement relative to size
				- Very targeted, niche audiences
				- Great for specific product categories
				- Cost-effective partnerships
				- Expected views: 100-1,000 per video
				
				Nano Influencers (10,000 - 50,000 subscribers):
				- Strong engagement rates
				- Growing, active communities
				- Good balance of reach and authenticity
				- Reasonable partnership costs
				- Expected views: 1,000-5,000 per video
				
				Mid-Tier Influencers (50,000 - 500,000 subscribers):
				- Professional content creation
				- Broader market reach
				- Established brand presence
				- Higher partnership value
				- Expected views: 5,000-50,000 per video
				
				Macro Influencers (500,000 - 1,000,000 subscribers):
				- Wide demographic reach
				- High production value
				- Premium partnership costs
				- Expected views: 50,000-100,000 per video
				
				Mega Influencers (1,000,000+ subscribers):
				- Maximum reach/awareness
				- Celebrity status
				- Highest partnership costs
				- Expected views: 100,000+ per video
				
				Consider these metrics for evaluation:
				1. Subscriber count vs. average views (engagement rate)
				2. Total view count (overall reach)
				3. Average views per video (consistent engagement)
				4. Channel size category and corresponding expected metrics
				
				Note: Output should be in "Yes" or "No" only.
				`,
			experimental_output: Output.object({
				schema: evaluationSchema,
			}),
		});

		return {
			evaluation: experimental_output.evaluation,
			tag: experimental_output.tag,
			reason: experimental_output.reason,
		};
	} catch (error) {
		console.error("Error in evalAi:", error);
		return {
			evaluation: "No",
			reason: "Error in evaluation",
			tag: "MicroInfluencer",
		};
	}
}
