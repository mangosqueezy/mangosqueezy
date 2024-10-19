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
import countries from "@/lib/country-flags";
import { cn } from "@/lib/utils";

type Props = {
	defaultValue: string;
	onSelect: (countryName: string) => void;
};

export function CountrySelector({ defaultValue, onSelect }: Props) {
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

	const selected = Object.values(countries).find(
		(country) => country.code === value,
	);

	return (
		<>
			<Button
				variant="outline"
				aria-expanded={open}
				onClick={() => setOpen((open) => !open)}
				className="w-full justify-between font-normal truncate bg-accent"
			>
				{value ? `${selected?.emoji} ${selected?.name}` : "Select country"}
				<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						{Object.values(countries).map((country) => (
							<CommandItem
								key={country.code}
								value={country.name}
								onSelect={() => {
									setValue(country.code);
									onSelect?.(country.name);
									setOpen(false);
								}}
							>
								{country.emoji} {country.name}
								<CheckIcon
									className={cn(
										"ml-auto h-4 w-4",
										value === country.code ? "opacity-100" : "opacity-0",
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
