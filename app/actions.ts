"use server";
import prisma from "@/lib/prisma";

export async function joinWaitListUser(body: FormData) {
  const email = body.get("email") as string;

  let message = "success";
  const result = await prisma.waitlist.findUnique({ where: { email } });

  if (result?.id) {
    message = "exists";
  } else {
    try {
      await prisma.waitlist.create({
        data: {
          email,
        },
      });
    } catch (err) {
      message = "error";
    }
  }

  return message;
}
