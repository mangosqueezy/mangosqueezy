"use client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useJune } from "@/hooks/useJune";
import { classNames } from "@/lib/utils";
import { CircleUser, Menu, Package2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getUser } from "./actions";
import { Providers } from "./providers";
import "@liveblocks/react-ui/styles.css";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const pathname = usePathname();
	const analytics = useJune(process.env.NEXT_PUBLIC_JUNE_API_KEY!);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUser();

			if (analytics && user) {
				analytics.identify(user.id, {
					email: user.email,
					name: user.first_name,
				});
			}
		};

		fetchUser();
	}, [analytics]);

	const handleLogout = async () => {
		const response = await fetch("https://www.mangosqueezy.com/api/logout", {
			method: "POST",
		});
		if (response.ok) {
			router.push("/");
		}
	};

	return (
		<div className="flex min-h-screen w-full flex-col">
			<header className="top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
				<nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
					<Link
						href="/"
						className="flex items-center gap-2 text-lg font-semibold md:text-base"
					>
						<Package2 className="h-6 w-6" />
						<span className="sr-only">Acme Inc</span>
					</Link>
					<Link
						href="/campaigns"
						className={classNames(
							pathname.includes("/campaigns")
								? "text-blue-400 hover:text-blue-500"
								: "text-gray-400 hover:text-gray-500",
							"font-medium flex",
						)}
					>
						Campaigns
					</Link>
					<Link
						href="/pipeline"
						className={classNames(
							pathname.includes("/pipeline")
								? "text-blue-400 hover:text-blue-500"
								: "text-gray-400 hover:text-gray-500",
							"font-medium flex",
						)}
					>
						Jobs
					</Link>
					<Link
						href="/metrics"
						className={classNames(
							pathname.includes("/metrics")
								? "text-blue-400 hover:text-blue-500"
								: "text-gray-400 hover:text-gray-500",
							"font-medium",
						)}
					>
						Metrics
					</Link>
					<Link
						href="/orders"
						className={classNames(
							pathname === "/orders"
								? "text-blue-400 hover:text-blue-500"
								: "text-gray-400 hover:text-gray-500",
							"font-medium",
						)}
					>
						Orders
					</Link>
					<Link
						href="/products"
						className={classNames(
							pathname === "/products"
								? "text-blue-400 hover:text-blue-500"
								: "text-gray-400 hover:text-gray-500",
							"font-medium",
						)}
					>
						Products
					</Link>
				</nav>
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="shrink-0 md:hidden"
						>
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle navigation menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left">
						<nav className="grid gap-6 text-lg font-medium">
							<Link
								href="/"
								className="flex items-center gap-2 text-lg font-semibold"
							>
								<Package2 className="h-6 w-6" />
								<span className="sr-only">Acme Inc</span>
							</Link>
							<Link
								href="/campaigns"
								className={classNames(
									pathname.includes("/campaigns")
										? "text-blue-400 hover:text-blue-500"
										: "text-gray-400 hover:text-gray-500",
									"font-medium flex",
								)}
							>
								Campaigns
							</Link>
							<Link
								href="/pipeline"
								className={classNames(
									pathname.includes("/pipeline")
										? "text-blue-400 hover:text-blue-500"
										: "text-gray-400 hover:text-gray-500",
									"font-medium",
								)}
							>
								Jobs
							</Link>
							<Link
								href="/metrics"
								className={classNames(
									pathname.includes("/metrics")
										? "text-blue-400 hover:text-blue-500"
										: "text-gray-400 hover:text-gray-500",
									"font-medium",
								)}
							>
								Metrics
							</Link>
							<Link
								href="/orders"
								className={classNames(
									pathname === "/orders"
										? "text-blue-400 hover:text-blue-500"
										: "text-gray-400 hover:text-gray-500",
									"font-medium",
								)}
							>
								Orders
							</Link>
							<Link
								href="/products"
								className={classNames(
									pathname === "/products"
										? "text-blue-400 hover:text-blue-500"
										: "text-gray-400 hover:text-gray-500",
									"font-medium",
								)}
							>
								Products
							</Link>
						</nav>
					</SheetContent>
				</Sheet>
				<div className="flex w-full justify-end items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
					<div className="h-5 w-px bg-gray-200 transition dark:bg-gray-800" />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="secondary" size="icon" className="rounded-full">
								<CircleUser className="h-5 w-5" />
								<span className="sr-only">Toggle user menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => router.push("/webhook")}>
								Webhook
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => router.push("/settings")}>
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
			<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
				<Providers>{children}</Providers>
			</main>
		</div>
	);
}
