"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import platforms from "@/lib/platform";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
	defaultValue: string;
	onSelect: (platformName: string) => void;
};

export function PlatformSelector({ defaultValue, onSelect }: Props) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState(defaultValue);

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const selected = Object.values(platforms).find(
		(platform) => platform.code === value,
	);

	return (
		<>
			<Button
				variant="outline"
				aria-expanded={open}
				onClick={() => setOpen((open) => !open)}
				className="w-full justify-between font-normal truncate bg-accent"
			>
				{value ? `${selected?.name}` : "Select platform"}
				<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						{Object.values(platforms).map((platform) => (
							<CommandItem
								key={platform.code}
								value={platform.name}
								onSelect={() => {
									setValue(platform.code);
									onSelect?.(platform.name);
									setOpen(false);
								}}
							>
								<Image
									src={platform.logo}
									alt={platform.name}
									width={24}
									height={24}
									className="rounded-full mr-2"
								/>
								{platform.name}
								<CheckIcon
									className={cn(
										"ml-auto h-4 w-4",
										value === platform.code ? "opacity-100" : "opacity-0",
									)}
								/>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
