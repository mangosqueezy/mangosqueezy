import { clsx } from "clsx";

export function Gradient({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div
			{...props}
			className={clsx(
				className,
				"bg-[linear-gradient(115deg,var(--tw-gradient-stops))] from-[#FFF4B8] from-[28%] via-[#FFC966] via-[70%] to-[#FFA94D] sm:bg-[linear-gradient(145deg,var(--tw-gradient-stops))]",
			)}
		/>
	);
}

export function GradientBackground() {
	return (
		<div className="relative mx-auto max-w-7xl">
			<div
				className={clsx(
					"absolute -right-60 -top-44 h-60 w-[36rem] transform-gpu md:right-0",
					"bg-[linear-gradient(115deg,var(--tw-gradient-stops))] from-[#FFF4B8] from-[28%] via-[#FFC966] via-[70%] to-[#FFA94D]",
					"rotate-[-10deg] rounded-full blur-3xl",
				)}
			/>
		</div>
	);
}
