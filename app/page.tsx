"use client";
import { Footer } from "@/components/aceternity-ui/footer";
import { Navigation } from "@/components/aceternity-ui/header";
import { motion } from "framer-motion";
import {
  HeroHighlight,
  Highlight,
} from "@/components/aceternity-ui/hero-highlight";
import { HoverBorderGradient } from "@/components/aceternity-ui/hover-border-gradient";
import { Input } from "@/components/aceternity-ui/input";
import { cn } from "@/lib/utils";
import Feature from "@/components/aceternity-ui/feature";
import { Toaster } from "react-hot-toast";
import Pricing from "@/components/aceternity-ui/pricing";

export default function Index() {
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
              className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-5xl leading-relaxed lg:leading-snug text-center mx-auto "
            >
              Empower your dedicated community with our{" "}
              <Highlight className="text-black dark:text-white">
                valuable crypto affiliate tools.
              </Highlight>
            </motion.h1>

            <div className="mt-40 flex justify-center items-center text-center">
              <form
                className="my-8 flex flex-col justify-center items-center"
                action="/"
                method="POST"
              >
                <LabelInputContainer className="mb-4 w-[260px]">
                  <Input
                    id="email"
                    name="email"
                    placeholder="partner@tapasom.com"
                    type="email"
                  />
                </LabelInputContainer>

                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  type="submit"
                  className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                >
                  <span>Join Waitlist</span>
                </HoverBorderGradient>
                <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
              </form>
            </div>
          </HeroHighlight>
        </div>

        <div className="mx-auto max-w-7xl">
          <Feature />
        </div>

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
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
