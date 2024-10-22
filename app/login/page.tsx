"use client";
import { getUser } from "@/app/(businesses)/actions";
import { Footer } from "@/components/aceternity-ui/footer";
import { Navigation } from "@/components/aceternity-ui/header";
import { Input } from "@/components/aceternity-ui/input";
import { Label } from "@/components/aceternity-ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { auth } from "./actions";

export default function Page() {
	const [state, loginAction] = useActionState(auth, null);
	const router = useRouter();

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUser();
			if (user?.id) {
				router.push("/pipeline");
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
				<Navigation />

				<div className="mx-auto h-full w-full flex items-center justify-center">
					<div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
						<h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
							Welcome to mangosqueezy
						</h2>
						<p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
							Login to Dashboard
						</p>

						<form className="my-8" action={loginAction}>
							<LabelInputContainer className="mb-4">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									name="email"
									placeholder="partner@mangosqueezy.com"
									type="email"
								/>

								{state && <p className="text-red-500">{state}</p>}
							</LabelInputContainer>

							<button
								type="submit"
								className="inline-flex items-center justify-center bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
							>
								Sign in &rarr;
								<BottomGradient />
							</button>

							<div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
						</form>
					</div>
				</div>

				<Footer />
			</div>
		</>
	);
}

const BottomGradient = () => {
	return (
		<>
			<span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
			<span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
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
