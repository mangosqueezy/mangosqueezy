import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { z } from "zod";

type PostMetrics = {
	replyCount: number;
	repostCount: number;
	likeCount: number;
	quoteCount: number;
};

type EvalAiProps = {
	handle: string;
	postMetrics?: PostMetrics | undefined;
};

export async function evalAi({ handle, postMetrics }: EvalAiProps) {
	// Define the schema using zod
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
		const profileResponse = await fetch(
			`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`,
		);
		const profile = await profileResponse.json();
		const bio = profile.description;
		const followersCount = profile.followersCount;
		const postsCount = profile.postsCount;

		// Use the schema in the generateText function
		const { experimental_output } = await generateText({
			model: openai("gpt-4o-mini", { structuredOutputs: true }),
			prompt: `
				You are an expert in social media marketing. Please evaluate the following data and assess whether the account is a good fit for a brand partnership.
Be lenient but don’t mark it as ‘Yes’ if it’s not suitable. If you believe the account has potential, mark it as ‘Yes’ and provide a reason along with relevant tags.
Also, discard profiles where the profile description indicates the user is a founder, co-founder, C-level executive, or investor.

		Profile Description: ${bio}
        Followers Count: ${followersCount}
		Posts Count: ${postsCount}
		Post Metrics: ${postMetrics ? JSON.stringify(postMetrics) : "N/A"}

        Here is the affiliate reference guide for evaluating affiliate accounts:
        
        Micro Influencers (1,000 - 10,000 followers):
        - Typically have highest engagement rates (5-10%)
        - Very targeted, niche audiences
        - Great for local/specialized products
        - Cost-effective partnerships
        
        Nano Influencers (10,000 - 50,000 followers):
        - Strong engagement rates (3-7%) 
        - Growing, active communities
        - Good balance of reach and authenticity
        - Reasonable partnership costs
        
        Mid-Tier Influencers (50,000 - 500,000 followers):
        - Moderate engagement (2-5%)
        - Professional content creation
        - Broader market reach
        - Higher partnership value
        
        Macro Influencers (500,000 - 1,000,000 followers):
        - Lower engagement rates (1-3%)
        - Wide demographic reach
        - High production value
        - Premium partnership costs
        
        Mega Influencers (1,000,000+ followers):
        - Lowest engagement (<1%)
        - Maximum reach/awareness
        - Celebrity status
        - Highest partnership costs
        
        Consider these metrics along with:
        - Recent posting activity
        - Content quality and consistency
        - Audience demographics
        - Brand alignment

			Also evaluate based on when the post was posted and if it is recent.
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
	} catch (_) {
		return {
			evaluation: "No",
			reason: "Error in evaluation",
			tag: "Unknown",
		};
	}
}
