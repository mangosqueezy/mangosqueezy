"use client";
import { getUser } from "@/app/(businesses)/actions";
import mangosqueezy from "@/assets/mangosqueezy-primary-logo.svg";
import Feature from "@/components/aceternity-ui/feature";
import { Footer } from "@/components/aceternity-ui/footer";
import Pricing from "@/components/aceternity-ui/pricing";
import { HighlightHub } from "@/components/magicui/highlight-hub";
import AnimatedHeroV0 from "@/components/mango-ui/animated-hero";
import Faq from "@/components/mango-ui/faq";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUser();
			setUserId(user?.id as string);
		};

		fetchUser();
	}, []);

	return (
		<div className="flex flex-col h-fit mx-auto">
			<div>
				<header className="absolute inset-x-0 top-0 z-50">
					<nav
						aria-label="Global"
						className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
					>
						<div className="flex lg:flex-1">
							<Link href="/" className="-m-1.5 p-1.5">
								<span className="sr-only">mangosqueezy</span>
								<Image
									src={mangosqueezy}
									priority={false}
									width={100}
									height={100}
									className="h-6 w-full"
									alt=""
								/>
							</Link>
						</div>
						<div className="flex lg:hidden">
							<button
								type="button"
								onClick={() => setMobileMenuOpen(true)}
								className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
							>
								<span className="sr-only">Open main menu</span>
								<Bars3Icon aria-hidden="true" className="h-6 w-6" />
							</button>
						</div>
						<div className="hidden lg:flex lg:gap-x-12" />
						<div className="hidden lg:flex lg:flex-1 lg:justify-end">
							{userId ? (
								<Button
									variant="outline"
									asChild
									className="bg-orange-600 hover:bg-orange-500"
								>
									<Link href="/pipeline">Pipeline</Link>
								</Button>
							) : (
								<Button asChild className="bg-orange-600 hover:bg-orange-500">
									<Link href="/login">
										Log in <span aria-hidden="true">&rarr;</span>
									</Link>
								</Button>
							)}
						</div>
					</nav>
					<Dialog
						open={mobileMenuOpen}
						onClose={setMobileMenuOpen}
						className="lg:hidden"
					>
						<div className="fixed inset-0 z-50" />
						<DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
							<div className="flex items-center justify-between">
								<a href="/" className="-m-1.5 p-1.5">
									<span className="sr-only">mangosqueezy</span>
									<Image
										src={mangosqueezy}
										priority={false}
										width={100}
										height={100}
										className="h-6 w-full"
										alt=""
									/>
								</a>
								<button
									type="button"
									onClick={() => setMobileMenuOpen(false)}
									className="-m-2.5 rounded-md p-2.5 text-gray-700"
								>
									<span className="sr-only">Close menu</span>
									<XMarkIcon aria-hidden="true" className="h-6 w-6" />
								</button>
							</div>
							<div className="mt-6 flow-root">
								<div className="-my-6 divide-y divide-gray-500/10">
									<div className="space-y-2 py-6" />
									<div className="py-6">
										{userId ? (
											<Button
												variant="outline"
												asChild
												className="bg-orange-600 hover:bg-orange-500"
											>
												<Link href="/pipeline">Pipeline</Link>
											</Button>
										) : (
											<Button
												asChild
												className="bg-orange-600 hover:bg-orange-500"
											>
												<Link href="/login">
													Log in <span aria-hidden="true">&rarr;</span>
												</Link>
											</Button>
										)}
									</div>
								</div>
							</div>
						</DialogPanel>
					</Dialog>
				</header>

				<AnimatedHeroV0 />
			</div>

			<Feature />
			<HighlightHub />
			<Pricing />
			<Faq />
			<Footer />
		</div>
	);
}
