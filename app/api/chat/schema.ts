import { z } from "zod";

// define a schema for the reply
export const chatSchema = z.object({
  chat: z.object({
    role: z.string().describe("The role of the user either user or assistant"),
    message: z
      .string()
      .describe(
        "The message answered by the AI assistant. Format the message in nice paragraphs and sentences and leave the blank space after each paragraph."
      ),
  }),
});

export type Expense = z.infer<typeof chatSchema>["chat"];
