"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
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
import Image from "next/image";
import XrpButton from "./xrp-button";
import MoonPayButton from "./moonpay-button";
import type { Products } from "@prisma/client";
import { Button } from "@/components/ui/button";

const formDefaultValues = {
  email: "",
  firstname: "",
  lastname: "",
  address: "",
  address_2: "",
  city: "",
  country: "",
  state: "",
  postal: "",
};

const FormSchema = z.object({
  email: z.string().min(1, {
    message: "Please enter the email.",
  }),
  firstname: z.string().min(1, {
    message: "Please enter the first name.",
  }),
  lastname: z.string().min(1, {
    message: "Please enter the last name.",
  }),
  address: z.string().min(1, {
    message: "Please enter the address.",
  }),
  address_2: z.string(),
  city: z.string().min(1, {
    message: "Please enter the city.",
  }),
  country: z.string().min(1, {
    message: "Please enter the country.",
  }),
  state: z.string().min(1, {
    message: "Please enter the state.",
  }),
  postal: z.string().min(1, {
    message: "Please enter the postal.",
  }),
});

type TBuyForm = {
  product: Products | null;
  formattedAmount: string;
};

export default function BuyForm({ product, formattedAmount }: TBuyForm) {
  const [mangosqueezyAI, setMangosqueezyAI] = React.useState("");
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isAILoading, setIsAILoading] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: formDefaultValues,
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log({
      data,
    });
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Checkout</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
              <div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Contact information</h2>

                  <div className="mt-4">
                    <label
                      htmlFor="email-address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email address
                    </label>
                    <div className="mt-1">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <>
                            <FormItem>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-10">
                  <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>

                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <label
                        htmlFor="first-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First name
                      </label>
                      <div className="mt-1">
                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <>
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            </>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="last-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last name
                      </label>
                      <div className="mt-1">
                        <FormField
                          control={form.control}
                          name="lastname"
                          render={({ field }) => (
                            <>
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            </>
                          )}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <div className="mt-1">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <>
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            </>
                          )}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="apartment"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Apartment, suite, etc.
                      </label>
                      <div className="mt-1">
                        <FormField
                          control={form.control}
                          name="address_2"
                          render={({ field }) => (
                            <>
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            </>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <div className="mt-1">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <>
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            </>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <div>
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <>
                              <FormItem>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild className="ml-3">
                                    <Button variant="outline" className="w-full">
                                      Select Country
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Country</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup
                                      value={mangosqueezyAI}
                                      onValueChange={setMangosqueezyAI}
                                    >
                                      <DropdownMenuRadioItem
                                        value="Canada"
                                        onClick={() => form.setValue("country", "Canada")}
                                      >
                                        Canada
                                      </DropdownMenuRadioItem>
                                      <DropdownMenuRadioItem
                                        value="India"
                                        onClick={() => form.setValue("country", "India")}
                                      >
                                        India
                                      </DropdownMenuRadioItem>
                                      <DropdownMenuRadioItem
                                        value="USA"
                                        onClick={() => form.setValue("country", "USA")}
                                      >
                                        United States
                                      </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <FormControl></FormControl>
                                <FormMessage />
                              </FormItem>
                            </>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                        State / Province
                      </label>
                      <div className="mt-1">
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <>
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            </>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="postal-code"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Postal code
                      </label>
                      <div className="mt-1">
                        <FormField
                          control={form.control}
                          name="postal"
                          render={({ field }) => (
                            <>
                              <FormItem>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            </>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="mt-10 lg:mt-0">
                <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <h3 className="sr-only">Items in your cart</h3>
                  <ul role="list" className="divide-y divide-gray-200">
                    {product && (
                      <li key={product.id} className="flex px-4 py-6 sm:px-6">
                        <div className="flex-shrink-0">
                          <Image
                            src={product.image_url as string}
                            alt={"product image"}
                            width={200}
                            height={200}
                            className="w-20 rounded-md"
                          />
                        </div>

                        <div className="ml-6 flex flex-1 flex-col">
                          <div className="flex">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm">
                                <a
                                  href={product.image_url as string}
                                  className="font-medium text-gray-700 hover:text-gray-800"
                                >
                                  {product.name}
                                </a>
                              </h4>
                            </div>
                          </div>

                          <div className="flex flex-1 items-end justify-between pt-2">
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {formattedAmount}
                            </p>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <XrpButton />
                    <MoonPayButton
                      email={form.getValues("email")}
                      amount={product?.price.toString() as string}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
