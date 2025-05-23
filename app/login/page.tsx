"use client";
import { getUser } from "@/app/(businesses)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { auth } from "./actions";

export default function Page() {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [state, setState] = useState<string | null>(null);
	const emailRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUser();
			if (user?.id) {
				router.push("/campaigns");
			}
		};
		fetchUser();
	}, [router]);

	useEffect(() => {
		if (state && state === "Please check your inbox") {
			toast.success(state);
		}
	}, [state]);

	return (
		<>
			<Toaster position="top-right" />
			<div className="mx-auto flex h-screen w-screen max-w-7xl flex-col overflow-hidden px-6">
				<div className="mx-auto h-full w-full flex items-center justify-center">
					<div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
						<h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
							Welcome to mangosqueezy
						</h2>
						<p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
							Login to Dashboard
						</p>

						<form
							className="my-8"
							onSubmit={async (e) => {
								e.preventDefault();
								setIsPending(true);
								const formData = new FormData();
								formData.append("email", emailRef.current?.value || "");

								const state = await auth(formData);
								setState(state);
								setIsPending(false);
							}}
						>
							<LabelInputContainer className="mb-4">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									ref={emailRef}
									name="email"
									placeholder="partner@mangosqueezy.com"
									type="email"
								/>

								{state && <p className="text-red-500">{state}</p>}
							</LabelInputContainer>

							<button
								type="submit"
								disabled={isPending}
								className="inline-flex items-center justify-center bg-linear-to-br relative group/btn from-orange-600 to-yellow-600 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
							>
								{isPending ? (
									<span className="flex items-center gap-2">
										<Loader className="w-4 h-4 animate-spin" />
										Sign in &rarr;
									</span>
								) : (
									<span className="flex items-center gap-2">
										Sign in &rarr;
									</span>
								)}
								<BottomGradient />
							</button>

							<div className="bg-linear-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
						</form>
					</div>
				</div>
			</div>
		</>
	);
}

const BottomGradient = () => {
	return (
		<>
			<span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-linear-to-r from-transparent via-cyan-500 to-transparent" />
			<span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-linear-to-r from-transparent via-indigo-500 to-transparent" />
		</>
	);
};

const LabelInputContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div className={cn("flex flex-col space-y-2 w-full", className)}>
			{children}
		</div>
	);
};
