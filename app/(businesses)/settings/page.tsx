"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Business } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { getUser } from "../actions";

export default function Settings() {
	const [loggedInUser, setLoggedInUser] = useState<Business | undefined | null>(
		null,
	);

	const getLoggedInUser = useCallback(async () => {
		const user = await getUser();
		setLoggedInUser(user);
	}, []);

	useEffect(() => {
		getLoggedInUser();
	}, [getLoggedInUser]);

	return (
		<div className="flex flex-col items-center justify-center w-full h-full">
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>Settings</CardTitle>
					<CardDescription>Your profile settings</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<div className="grid w-full items-center gap-4">
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="email">Email</Label>
								<Input
									disabled
									type="email"
									value={loggedInUser?.email || ""}
									id="email"
									className="cursor-not-allowed"
								/>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
