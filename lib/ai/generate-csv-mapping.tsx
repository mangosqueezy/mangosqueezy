"use server";

import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";

export async function generateCsvMapping(
	fieldColumns: string[],
	firstRows: Record<string, string>[],
) {
	const stream = createStreamableValue();

	(async () => {
		const { partialObjectStream } = streamObject({
			model: openai("gpt-4o-mini"),
			schema: z.object({
				campaign_name: z.string().optional().describe("The campaign name"),
				product_name: z.string().optional().describe("The product name"),
				product_description: z
					.string()
					.optional()
					.describe("The product description"),
				product_price: z.string().optional().describe("The product price"),
				affiliate_count: z.number().optional().describe("The affiliate count"),
				location: z.string().optional().describe("The location"),
				product_price_type: z
					.string()
					.optional()
					.describe("The product price type"),
				lead: z.number().optional().describe("The lead commission in %"),
				click: z.number().optional().describe("The click commission in %"),
				sale: z.number().optional().describe("The sale commission in %"),
			}),
			prompt: `
The following columns are the headings from a CSV import file for importing a company's products.
Map these column names to the correct fields in our database (campaign_name, product_name, product_description, product_price, affiliate_count, location, product_price_type, lead, click, sale) by providing the matching column name for each field.
You may also consult the first few rows of data to help you make the mapping, but you are mapping the columns, not the values.
If you are not sure or there is no matching column, omit the value.

Columns:
${fieldColumns.join(",")}

First few rows of data:
${firstRows.map((row) => JSON.stringify(row)).join("\n")}
`,
			temperature: 0.2,
		});

		for await (const partialObject of partialObjectStream) {
			stream.update(partialObject);
		}

		stream.done();
	})();

	return { object: stream.value };
}
