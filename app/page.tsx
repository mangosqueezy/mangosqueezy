"use client";
import { Footer } from "@/components/aceternity-ui/footer";
import { Navigation } from "@/components/aceternity-ui/header";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/aceternity-ui/hero-highlight";
import { HoverBorderGradient } from "@/components/aceternity-ui/hover-border-gradient";
import { Input } from "@/components/aceternity-ui/input";
import { cn } from "@/lib/utils";
import Feature from "@/components/aceternity-ui/feature";
import toast, { Toaster } from "react-hot-toast";
import Pricing from "@/components/aceternity-ui/pricing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { joinWaitListUser } from "./actions";

const FormSchema = z.object({
  email: z.string().min(1, {
    message: "Please enter the email.",
  }),
});

export default function Index() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const formData = new FormData();
    formData.append("email", data.email);

    const result = await joinWaitListUser(formData);
    if (result === "success") {
      toast.success("Successfully added to waitlist. We'll notify when a spot opens up.");
    } else if (result === "exists") {
      toast.success("Thanks for your interest! You're already on our waitlist.");
    } else {
      toast.error("Something went wrong please try again later");
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col h-screen mx-auto">
        <div className="flex flex-col w-full mx-auto max-w-7xl">
          <Navigation />
        </div>
        <div className="w-full h-full">
          <HeroHighlight>
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: [20, -5, 0],
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="text-3xl px-4 md:text-4xl lg:text-6xl font-bold text-neutral-700 dark:text-white max-w-7xl leading-relaxed lg:leading-snug text-center mx-auto "
            >
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 dark:text-white ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  OSS affiliate marketing platform.{" "}
                  <a
                    href="https://github.com/mangosqueezy/mangosqueezy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-orange-600"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    Read more <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
              Empower your dedicated community with our{" "}
              <Highlight className="text-black dark:text-white">
                valuable crypto affiliate tools.
              </Highlight>
            </motion.h1>

            <div className="mt-20 flex justify-center items-center text-center">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="my-8 flex flex-col justify-center items-center"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <>
                        <FormItem>
                          <FormControl>
                            <LabelInputContainer className="mb-4 w-[260px]">
                              <Input placeholder="partner@mangosqueezy.com" {...field} />
                            </LabelInputContainer>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </>
                    )}
                  />

                  <HoverBorderGradient
                    containerClassName="rounded-full mt-3"
                    as="button"
                    type="submit"
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                  >
                    <span>Join Waitlist</span>
                  </HoverBorderGradient>
                  <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
                </form>
              </Form>
            </div>
          </HeroHighlight>
        </div>

        <Feature />
        <Pricing />
        <Footer />
      </div>
    </>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};
