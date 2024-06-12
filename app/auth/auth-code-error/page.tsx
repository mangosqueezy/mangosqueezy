"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Error() {
  const searchParams = useSearchParams();

  return (
    <Suspense>
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            We encountered an error
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Sorry, something went wrong. Could you please try again?
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href={`/join/${searchParams.get("slug")}`}
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Go back home
            </Link>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
