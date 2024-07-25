import { Xumm } from "xumm";

const xumm = new Xumm(process.env.XUMM_API_KEY!, process.env.XUMM_API_SECRET);

export const dynamic = "force-dynamic";

async function createXummPayment(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  try {
    const { created, resolved }: any = await xumm.payload?.createAndSubscribe(
      {
        TransactionType: "Payment",
        Destination: process.env.MANGOSQUEEZY_WALLET_ADDRESS,
        Amount: String(1000000), // one million drops, 1 XRP
      },
      eventMessage => {
        if ("opened" in eventMessage.data) {
          console.log("Payload opened");
        }
        if ("signed" in eventMessage.data) {
          return eventMessage;
        }
      }
    );

    controller.enqueue(encoder.encode(`data: ${created.next.always}\n\n`));
    controller.enqueue(encoder.encode(`data: ${created.refs.qr_png}\n\n`));

    const payload = await resolved;
    controller.enqueue(encoder.encode(`data: ${payload}\n\n`));

    return payload;
  } catch (error) {
    console.error("Error creating XUMM payment:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        await createXummPayment(controller, encoder);
      } catch (error) {
        console.error("Failed to create XUMM payment:", error);
        controller.error(error);
        return;
      }

      request.signal.addEventListener("abort", () => {
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
