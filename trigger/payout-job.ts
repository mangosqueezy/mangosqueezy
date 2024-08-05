import { logger, task } from "@trigger.dev/sdk/v3";
import xrpl from "xrpl";

export const payoutTask = task({
  id: "payout-task",
  run: async (payload: any, { ctx }) => {
    logger.log("Create affiliate task...", { payload, ctx });

    const { amount, destination_address } = payload;

    let net = "wss://xahau-test.net/";
    const client = new xrpl.Client(net);
    await client.connect();

    const mangosqueezy_wallet = xrpl.Wallet.fromSeed(process.env.MANGOSQUEEZY_WALLET_SECRET_SEED!);

    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: mangosqueezy_wallet.address,
      Amount: xrpl.xrpToDrops(amount),
      Destination: destination_address, // wallet address of the business user
    });

    const signed = mangosqueezy_wallet.sign(prepared);

    const transaction: any = await client.submitAndWait(signed.tx_blob);

    const result =
      "Balance changes: " +
      JSON.stringify(xrpl.getBalanceChanges(transaction?.result.meta), null, 2);

    client.disconnect();

    return result;
  },
});
