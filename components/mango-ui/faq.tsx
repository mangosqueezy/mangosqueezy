import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

const faqs = [
	{
		question: "Does mangosqueezy work for every kind of company?",
		answer:
			"Yes, mangosqueezy works for every kind of company. Whether you are a small startup or a large enterprise, mangosqueezy can help you to setup, manage & grow your affiliate program.",
	},
	{
		question: "Does mangosqueezy offer a Free plan?",
		answer:
			"Yes, we offer a free plan. You can start with our free plan and upgrade to a paid plan when you are ready.",
	},
	{
		question: "What is SaaS Affiliate Marketing?",
		answer:
			"With Affiliate Marketing you are asking other people to do the marketing for you. When they deliver you paid clients (pay per performance) they will receive a commission. As SaaS means recurring subscriptions, it also means recurring commissions for the Affiliates. Making it a true win-win for both of them. No high upfront costs for SaaS & high potential earnings for affiliates.",
	},
	{
		question: "Does mangosqueezy help me to find new affiliates?",
		answer:
			"Yes, we have a network of B2B and B2C SaaS affiliates that are looking to promote your product.",
	},
	{
		question: "How does mangosqueezy work?",
		answer:
			"mangosqueezy is a SaaS platform that helps you to setup, manage & grow an affiliate program. You can create your own affiliate program, invite affiliates to join and track their performance.",
	},
];

export default function Faq() {
	return (
		<div className="bg-white py-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
					<h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
						Frequently asked questions
					</h2>
					<dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
						{faqs.map((faq) => (
							<Disclosure key={faq.question} as="div" className="pt-6">
								<dt>
									<DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900">
										<span className="text-base font-semibold leading-7">
											{faq.question}
										</span>
										<span className="ml-6 flex h-7 items-center">
											<PlusIcon
												aria-hidden="true"
												className="h-6 w-6 group-data-open:hidden"
											/>
											<MinusIcon
												aria-hidden="true"
												className="h-6 w-6 [.group:not([data-open])_&]:hidden"
											/>
										</span>
									</DisclosureButton>
								</dt>
								<DisclosurePanel as="dd" className="mt-2 pr-12">
									<p className="text-base leading-7 text-gray-600">
										{faq.answer}
									</p>
								</DisclosurePanel>
							</Disclosure>
						))}
					</dl>
				</div>
			</div>
		</div>
	);
}
