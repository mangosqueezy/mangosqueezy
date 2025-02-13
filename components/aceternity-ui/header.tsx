"use client";
import { getUser } from "@/app/(businesses)/actions";
import mangosqueezy from "@/assets/mangosqueezy-primary-logo.svg";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navigation() {
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUser();
			setUserId(user?.id as string);
		};

		fetchUser();
	}, []);

	return (
		<header className="relative flex h-[80px] min-h-[80px] items-center justify-between px-3">
			{/* Left */}
			<Link href="/" className="actionable flex h-8 items-center gap-1">
				<span className="text-base font-medium text-gray-600 dark:text-gray-400">
					<Image
						src={mangosqueezy}
						priority={false}
						width={100}
						height={100}
						className="h-6 w-full"
						alt=""
					/>
				</span>
			</Link>

			{/* Right */}
			<div className="flex items-center gap-2">
				<div className="mx-1 h-5 w-px bg-gray-200 transition dark:bg-gray-800" />

				<div className="flex items-center gap-2">
					{userId ? (
						<Button variant="outline" asChild>
							<Link href="/pipeline">Pipeline</Link>
						</Button>
					) : (
						<Button asChild className="bg-orange-600 hover:bg-orange-500">
							<Link href="/login">Login</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
