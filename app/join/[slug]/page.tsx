"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import toast, { Toaster } from "react-hot-toast";
import { createAffiliateAction } from "./actions";
import { Navigation } from "./components/header";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  firstname: z.string().min(1, {
    message: "Please enter the first name.",
  }),
  lastname: z.string().min(1, {
    message: "Please enter the last name.",
  }),
  email: z.string().min(1, {
    message: "Please enter the email.",
  }),
  description: z.string().min(1, {
    message: "Please enter the dsecription.",
  }),
  wallet: z.string().min(1, {
    message: "Please enter the wallet.",
  }),
  url: z.string().min(1, {
    message: "Please enter the url.",
  }),
  youtube: z.string(),
  instagram: z.string(),
});

export default function Affiliates({ params }: { params: { slug: string } }) {
  const [mangosqueezyAI, setMangosqueezyAI] = React.useState("");
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      url: "",
      youtube: "",
      instagram: "",
      wallet: "",
      description: "",
    },
  });

  const callMangosqueezyAI = React.useCallback(
    async (query: string) => {
      const formData = new FormData();
      formData.append("query", query);
      formData.append("text", form.getValues("description"));

      const response = await fetch("https://mangosqueezy.com/api/llm", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      form.setValue("description", result);
    },
    [form],
  );

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const formData = new FormData();

    formData.append("firstname", data.firstname);
    formData.append("lastname", data.lastname);
    formData.append("email", data.email);
    formData.append("description", data.description);
    formData.append("wallet", data.wallet);
    formData.append("url", data.url);
    formData.append("youtube", data.youtube);
    formData.append("instagram", data.instagram);
    formData.append("company-slug", params.slug);

    setIsButtonLoading(true);
    const result = await createAffiliateAction(formData);
    if (result === "success") {
      toast.success("Successfully created your account");
    } else if (result === "exists") {
      toast.success("Account is already created");
    } else {
      toast.error("Something went wrong please try again later");
    }
    setIsButtonLoading(false);
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex min-h-screen w-full flex-col">
        <header className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
          <div className="flex flex-col w-full mx-auto">
            <Navigation />
          </div>
        </header>
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          <h1 className="text-3xl font-semibold tracking-wide">Affiliates</h1>
          <h3 className="text-xl font-semibold tracking-wide">
            Ready to earn in crypto. Tell us something about you!!
          </h3>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <div className="grid grid-cols-2 gap-3 space-y-0">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Mango" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Squeezy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 space-y-0">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="hello-user@mangosqueezy.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wallet"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">
                          Wallet Address
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="rXRPLWalletAddress" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 space-y-0">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">
                          Website
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="www.any-link.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtube"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">
                          Youtube
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="@youtuber" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">
                          Instagram
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="@mangosqueezy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <>
                    <FormItem>
                      <FormLabel className="truncate text-black">
                        Description
                      </FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild className="ml-3">
                          <Button variant="outline" size="icon">
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuLabel>AI Prompts</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={mangosqueezyAI}
                            onValueChange={setMangosqueezyAI}
                          >
                            <DropdownMenuRadioItem
                              value="fix-grammar"
                              onClick={() => callMangosqueezyAI("fix grammar")}
                            >
                              Fix Grammar
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value="improve-writing"
                              onClick={() =>
                                callMangosqueezyAI("improve writing")
                              }
                            >
                              Improve writing
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value="rephrase"
                              onClick={() => callMangosqueezyAI("rephrase")}
                            >
                              Rephrase
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <FormControl>
                        <Textarea
                          placeholder="Get more customers by using affiliate marketing. This helps you make more money, get more people buying from you, and build lasting relationships with your partners' followers."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </>
                )}
              />

              <Button
                disabled={isButtonLoading}
                className={cn(
                  isButtonLoading ? "cursor-not-allowed" : "cursor-pointer",
                )}
                type="submit"
              >
                Save
                {isButtonLoading && (
                  <Loader className="size-5 ml-2 animate-spin" />
                )}
              </Button>
            </form>
          </Form>
        </main>
      </div>
    </>
  );
}
