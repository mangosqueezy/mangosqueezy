import { CheckIcon } from "@heroicons/react/20/solid";

const includedFeatures = [
  "Instantly pay the affiliate commissions",
  "No worries about chargebacks",
  "Instantly accept payments globally",
  "Easy global payouts through cross-border",
];

export default function Pricing() {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
            Simple no-tricks pricing
          </h2>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 dark:ring-gray-500 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight dark:text-white">Affiliate</h3>
            <p className="mt-6 text-base leading-7 text-gray-600 dark:text-white">
              {`You won't be charged monthly fees for using our affiliate features, and we only take a small percentage from each sale, letting you keep most of what you earn.`}
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-md font-bold leading-6 text-green-600">
                What’s included
              </h4>
              <div className="h-px flex-auto bg-gray-100" />
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 dark:text-white sm:grid-cols-2 sm:gap-6">
              {includedFeatures.map(feature => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon className="h-6 w-5 flex-none text-green-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-200 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-5xl font-semibold text-gray-900 dark:text-white">Free</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-600 dark:text-white">
                    $0
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-white">
                    /month
                  </span>
                </p>
                <form className="mx-auto mt-10 flex max-w-md gap-x-4" action="/" method="POST">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-black/10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                  />
                  <button
                    type="submit"
                    className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Notify me
                  </button>
                </form>
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Free while in beta. There will also be a freemium plan for all our users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
