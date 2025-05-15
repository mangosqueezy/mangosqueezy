"use client";

import { getUser } from "@/app/(businesses)/actions";
import { getSubscriptionData } from "@/app/actions";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { getPlanFromPriceId } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import {
	ChartSpline,
	ClipboardPenLine,
	Radio,
	ShoppingBag,
	UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";

const data = {
	user: {
		name: "",
		email: "",
		avatar: "",
	},
	teams: [
		{
			name: "Team 1",
			logo: UserRound,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Campaigns",
			url: "/campaigns",
			icon: Radio,
			isActive: true,
		},
		{
			title: "Metrics",
			url: "/metrics",
			icon: ChartSpline,
		},
		{
			title: "Orders",
			url: "/orders",
			icon: ClipboardPenLine,
		},
		{
			title: "Products",
			url: "/products",
			icon: ShoppingBag,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const router = useRouter();
	const [user, setUser] = useState<{
		name: string;
		email: string;
		avatar: string;
	} | null>(null);
	const [teams, setTeams] = useState<
		{
			name: string;
			logo: React.ElementType;
			plan: string;
		}[]
	>([]);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUser();
			if (user) {
				const parsedUser = {
					name: user.first_name ?? "",
					email: user.email,
					avatar: "",
				};
				setUser(parsedUser);

				const subscription = await getSubscriptionData(
					user?.stripe_subscription_id as string,
				);
				const plan = getPlanFromPriceId(subscription.price_id);

				if (subscription.status === "trialing") {
					const days = subscription.trial_end
						? differenceInDays(
								new Date(subscription.trial_end * 1000),
								new Date(),
							)
						: 0;

					setTeams([
						{
							name: user.first_name ?? "",
							logo: UserRound,
							plan: `Trial (${days} days left)`,
						},
					]);
				} else {
					setTeams([
						{
							name: user.first_name ?? "",
							logo: UserRound,
							plan: plan,
						},
					]);
				}
			}
		};

		fetchUser();
	}, []);

	const handleLogout = async () => {
		const response = await fetch("https://www.mangosqueezy.com/api/logout", {
			method: "POST",
		});
		if (response.ok) {
			router.push("/");
		}
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user ?? data.user} handleLogout={handleLogout} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
