import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { BytesOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const runtime = "edge";

const OPENAI_KEY = process.env.OPENAI_KEY;
const HELICONE_API_KEY = process.env.HELICONE_API_KEY;

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map(doc => doc.pageContent);
  return serializedDocs.join("\n\n");
};

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map(message => {
    if (message.role === "user") {
      return `Human: ${message.content}`;
    } else if (message.role === "assistant") {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join("\n");
};

const CONDENSE_QUESTION_TEMPLATE = `Given a chat history and the latest user question
which might reference context in the chat history,
formulate a standalone question which can be understood
without the chat history.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;

const condenseQuestionPrompt = PromptTemplate.fromTemplate(CONDENSE_QUESTION_TEMPLATE);

const ANSWER_TEMPLATE = ` You are an assistant for question-answering tasks. Use
the following pieces of retrieved context to answer the
question. If you don't know the answer, just say that you
don't know.

Answer the question based only on the following context and chat history:
<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

/**
 * This handler initializes and calls a retrieval chain. It composes the chain using
 * LangChain Expression Language. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#conversational-retrieval-chain
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;
    const profile = body.profile ?? [];
    const video = body.video ?? [];
    const webpagesData = body.webpagesData ?? [];

    // Convert the JSON object to a JSON string
    const profileJsonString = JSON.stringify(profile);
    const videoJsonString = JSON.stringify(video);

    const model = new ChatOpenAI({
      apiKey: OPENAI_KEY,
      model: "gpt-4o",
      temperature: 0.2,
      configuration: {
        basePath: "https://oai.hconeai.com/v1",
        defaultHeaders: {
          "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
        },
      },
    });
    let docs = [
      new Document({
        pageContent: profileJsonString,
        metadata: { id: 1, title: "Profile Document" },
      }),
      new Document({
        pageContent: videoJsonString,
        metadata: { id: 2, title: "Video Document" },
      }),
      new Document({
        pageContent: `Hi, my name is mangosqueezy AI, and I was born in June 2024 at Buildspace S5.
        I am here to assist you with all your queries and help you make the right decision to partner up with the influencer to grow your business.`,
        metadata: { id: 3, title: "AI Profile Information" },
      }),
    ];

    webpagesData.forEach((pageData: any, index: number) => {
      docs.push(
        new Document({
          pageContent: pageData.pageContent,
          metadata: { id: index + 4, title: pageData.source },
        })
      );
    });

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 300,
    });
    const splits = await textSplitter.splitDocuments(docs);

    const vectorstore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings({
        openAIApiKey: OPENAI_KEY,
        model: "text-embedding-3-large",
      })
    );

    /**
     * We use LangChain Expression Language to compose two chains.
     * To learn more, see the guide here:
     *
     * https://js.langchain.com/docs/guides/expression_language/cookbook
     *
     * You can also use the "createRetrievalChain" method with a
     * "historyAwareRetriever" to get something prebaked.
     */
    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser(),
    ]);

    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>(resolve => {
      resolveWithDocuments = resolve;
    });

    const retriever = vectorstore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    const retrievalChain = retriever.pipe(combineDocumentsFn);

    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([input => input.question, retrievalChain]),
        chat_history: input => input.chat_history,
        question: input => input.question,
      },
      answerPrompt,
      model,
    ]);

    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        chat_history: input => input.chat_history,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages),
    });

    const documents = await documentPromise;
    const serializedSources = Buffer.from(
      JSON.stringify(
        documents.map(doc => {
          return {
            pageContent: doc.pageContent.slice(0, 50) + "...",
            metadata: doc.metadata,
          };
        })
      )
    ).toString("base64");

    return new StreamingTextResponse(stream, {
      headers: {
        "x-message-index": (previousMessages.length + 1).toString(),
        "x-sources": serializedSources,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
