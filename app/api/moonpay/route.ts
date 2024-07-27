import { MoonPay } from "@moonpay/moonpay-node";
import { NextResponse } from "next/server";

const moonPay = new MoonPay(process.env.MOONPAY_SK!);

export async function POST(request: Request) {
  const body = await request.formData();
  const amount: string = body.get("amount") as string;
  const email = body.get("email") as string;

  const params = {
    email,
    apiKey: process.env.MOONPAY_PK!,
    baseCurrencyCode: "USD",
    baseCurrencyAmount: amount,
    walletAddress: process.env.MANGOSQUEEZY_WALLET_ADDRESS,
    currencyCode: "XRP",
    /**
     * A URL you'd like to redirect the customer to upon completion of the purchase.
     * We will append the transaction's ID and status as query parameters to your URL.
     * Must be URL encoded (e.g. https%3A%2F%2Fwww.myurl.com) MoonPay will add transactionId={{transactionId}}&transactionStatus=pending to the redirectURL.
     * We support deep links and appending your own custom parameters.
     */
    redirectURL: "https%3A%2F%2Fmangosqueezy.com%2Fsuccess",
  };

  const url = moonPay.url.generate({ flow: "buy", params });

  return NextResponse.redirect(url);
}
