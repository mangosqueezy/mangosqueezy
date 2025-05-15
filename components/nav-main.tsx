"use client";

import type { LucideIcon } from "lucide-react";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { classNames } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>mangosqueezy</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton
							tooltip={item.title}
							onClick={() => router.push(item.url)}
							className={classNames(
								pathname.includes(item.url)
									? "bg-orange-50 text-orange-500 hover:text-orange-500"
									: "text-gray-500 hover:text-gray-500",
								"flex",
							)}
						>
							{item.icon && <item.icon />}
							<span>{item.title}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
