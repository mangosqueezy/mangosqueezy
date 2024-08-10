import { logger, task } from "@trigger.dev/sdk/v3";
import { Client, Wallet, xrpToDrops, getBalanceChanges } from "@transia/xrpl";
import { Resend } from "resend";

export const payoutTask = task({
  id: "payout-task",
  run: async (payload: any, { ctx }) => {
    logger.log("payout task...", { payload, ctx });

    const {
      commission,
      amount,
      business_wallet_address,
      affiliate_wallet_address,
      business_email,
      affiliate_email,
    } = payload;

    let net = "wss://xahau-test.net/";
    const client = new Client(net);
    await client.connect();

    const mangosqueezy_wallet = Wallet.fromSeed(process.env.MANGOSQUEEZY_WALLET_SECRET_SEED!);
    const commissionAmount = commission * parseFloat(amount);
    const amountForBusiness = parseFloat(amount) - commissionAmount;
    let result = "success";
    try {
      const businessPayload = await client.autofill({
        TransactionType: "Payment",
        Account: mangosqueezy_wallet.address,
        Amount: xrpToDrops(amountForBusiness),
        NetworkID: 21338,
        Destination: business_wallet_address, // wallet address of the business user
      });

      const signed = mangosqueezy_wallet.sign(businessPayload);

      const businessTransaction: any = await client.submitAndWait(signed.tx_blob);

      logger.log("payout task for business result is...", {
        balance: getBalanceChanges(businessTransaction?.result.meta),
      });

      const affiliatePayload = await client.autofill({
        TransactionType: "Payment",
        Account: mangosqueezy_wallet.address,
        Amount: xrpToDrops(commissionAmount),
        NetworkID: 21338,
        Destination: affiliate_wallet_address, // wallet address of the affiliate user
      });

      const affiliateSigned = mangosqueezy_wallet.sign(affiliatePayload);

      const affiliateTransaction: any = await client.submitAndWait(affiliateSigned.tx_blob);

      logger.log("payout task for affiliate result is...", {
        balance: getBalanceChanges(affiliateTransaction?.result.meta),
      });

      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: "mangosqueezy <amit@tapasom.com>",
        to: [business_email, affiliate_email],
        subject: "Your Payout Has Been Sent!",
        reply_to: process.env.SLACK_REPLY_TO,
        text: `We're pleased to inform you that your payout has been successfully sent to your account. If you have any questions or concerns, feel free to reply to this email or contact our support team.`,
      });

      logger.log("email sent to users...", {
        emails: { business_email, affiliate_email },
        data,
        error,
      });
    } catch (error) {
      result = "error";
      console.error(error);
    }

    client.disconnect();

    return result;
  },
});
