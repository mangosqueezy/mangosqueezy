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
				"bg-linear-115 from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] sm:bg-linear-145",
				// "bg-[linear-gradient(115deg,var(--tw-gradient-stops))] from-[#FFF4B8] from-28% via-[#FFC966] via-70% to-[#FFA94D] sm:bg-[linear-gradient(145deg,var(--tw-gradient-stops))]",
			)}
		/>
	);
}

export function GradientBackground() {
	return (
		<div className="relative mx-auto max-w-7xl">
			<div
				className={clsx(
					"absolute -top-44 -right-60 h-60 w-xl transform-gpu md:right-0",
					"bg-linear-115 from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff]",
					"rotate-[-10deg] rounded-full blur-3xl",
				)}
			/>
		</div>
	);
}
