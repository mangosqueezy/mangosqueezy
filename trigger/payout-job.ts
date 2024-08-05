import { logger, task } from "@trigger.dev/sdk/v3";
import { Client, Wallet, xrpToDrops, getBalanceChanges } from "@transia/xrpl";

export const payoutTask = task({
  id: "payout-task",
  run: async (payload: any, { ctx }) => {
    logger.log("payout task...", { payload, ctx });

    const { amount, business_wallet_address, affiliate_wallet_address } = payload;

    let net = "wss://xahau-test.net/";
    const client = new Client(net);
    await client.connect();

    const mangosqueezy_wallet = Wallet.fromSeed(process.env.MANGOSQUEEZY_WALLET_SECRET_SEED!);

    let result = "success";
    try {
      const businessPayload = await client.autofill({
        TransactionType: "Payment",
        Account: mangosqueezy_wallet.address,
        Amount: xrpToDrops(amount),
        NetworkID: 21338,
        Destination: business_wallet_address, // wallet address of the business user
      });

      const signed = mangosqueezy_wallet.sign(businessPayload);

      const businessTransaction: any = await client.submitAndWait(signed.tx_blob);

      logger.log("payout task for business result is...", {
        balance: getBalanceChanges(businessTransaction?.result.meta),
      });

      const commission = 0.2 * parseFloat(amount);
      const affiliatePayload = await client.autofill({
        TransactionType: "Payment",
        Account: mangosqueezy_wallet.address,
        Amount: xrpToDrops(commission),
        NetworkID: 21338,
        Destination: affiliate_wallet_address, // wallet address of the affiliate user
      });

      const affiliateSigned = mangosqueezy_wallet.sign(affiliatePayload);

      const affiliateTransaction: any = await client.submitAndWait(affiliateSigned.tx_blob);

      logger.log("payout task for affiliate result is...", {
        balance: getBalanceChanges(affiliateTransaction?.result.meta),
      });
    } catch (error) {
      result = "error";
      console.error(error);
    }

    client.disconnect();

    return result;
  },
});
