import { z } from "zod";

// define a schema for the reply
export const replySchema = z.object({
  email: z.object({
    affiliateLink: z.boolean(),
    content: z.string(),
  }),
});
