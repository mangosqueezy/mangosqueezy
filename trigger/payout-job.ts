import { logger, task } from "@trigger.dev/sdk/v3";
import { Client, Wallet, xrpToDrops, getBalanceChanges } from "xrpl";

export const payoutTask = task({
  id: "payout-task",
  run: async (payload: any, { ctx }) => {
    logger.log("payout task...", { payload, ctx });

    const { amount, destination_address } = payload;

    let net = "wss://xahau-test.net/";
    const client = new Client(net);
    await client.connect();

    const mangosqueezy_wallet = Wallet.fromSeed(process.env.MANGOSQUEEZY_WALLET_SECRET_SEED!);

    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: mangosqueezy_wallet.address,
      Amount: xrpToDrops(amount),
      Destination: destination_address, // wallet address of the business user
    });

    const signed = mangosqueezy_wallet.sign(prepared);

    const transaction: any = await client.submitAndWait(signed.tx_blob);

    const result =
      "Balance changes: " + JSON.stringify(getBalanceChanges(transaction?.result.meta), null, 2);

    logger.log("payout task result is...", { result });

    client.disconnect();

    return result;
  },
});
