"use client";
import { Button } from "@/components/mango-ui/button";

type TMoonPayButton = {
  email: string;
  amount: string;
};

export default function MoonPayButton({ email, amount }: TMoonPayButton) {
  const callMoonpay = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("amount", amount);
    await fetch("https://mangosqueezy.com/api/moonpay");
  };

  return (
    <Button
      type="button"
      onClick={callMoonpay}
      color="purple"
      className="w-full px-4 py-3 cursor-pointer"
    >
      Moonpay
    </Button>
  );
}
