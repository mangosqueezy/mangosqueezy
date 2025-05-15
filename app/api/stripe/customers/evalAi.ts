import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import type Stripe from "stripe";
import { z } from "zod";

export type Difficulty = "easy" | "medium" | "hard";

type EvalAiProps = {
	charges: Stripe.Response<Stripe.ApiList<Stripe.Charge>>;
	difficulty?: Difficulty;
};

export async function evalAi({ charges, difficulty = "hard" }: EvalAiProps) {
	const evaluationSchema = z.object({
		evaluation: z.enum(["Yes", "No"]),
		total_charges: z.number(),
		reason: z.string(),
	});

	try {
		const { experimental_output } = await generateText({
			model: openai("gpt-4o-mini", { structuredOutputs: true }),
			prompt: `You're given a Stripe customer charge object.
Based on this data, decide if the customer looks like a power user — someone likely to love the product, and potentially a good fit to promote it as an affiliate.
Be ${difficulty} in your evaluation but don't mark it as 'Yes' if it's not suitable. If you believe the customer has potential, mark it as 'Yes' and provide a reason and total charges.

Here's the customer's charge history:
${charges.data.map((charge) => `${charge.id}: ${charge.amount}`).join("\n")}

A power user may show signs like:
- Has paid (i.e., paid: true, status: succeeded)
- Has made more than one charge historically (if shown)
- Uses a real payment method (e.g., a credit card)
- Has not asked for a refund

Based only on the given charge object, answer:
- Is this user likely a power user? (Yes/No)
- Why or why not? (Give a brief, clear reason)
- Would you recommend reaching out to invite them as an affiliate? (Yes/No)
`,
			experimental_output: Output.object({
				schema: evaluationSchema,
			}),
		});

		return {
			evaluation: experimental_output.evaluation,
			reason: experimental_output.reason,
			total_charges: experimental_output.total_charges,
		};
	} catch (error) {
		console.error("Error in evalAi:", error);
		return {
			evaluation: "No",
			reason: "Error in evaluation",
		};
	}
}
