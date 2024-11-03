import Marquee from "@/components/magicui/marquee";

const reviews = [
	{
		name: "open-source",
		username: "@open-source",
	},
	{
		name: "affiliate",
		username: "@affiliate",
	},
	{
		name: "marketing",
		username: "@marketing",
	},
	{
		name: "tool",
		username: "@tool",
	},
	{
		name: "It's",
		username: "@its",
	},
	{
		name: "reliable,",
		username: "@reliable",
	},
	{
		name: "fast,",
		username: "@fast",
	},
	{
		name: "cheap,",
		username: "@cheap",
	},
	{
		name: "and",
		username: "@and",
	},
	{
		name: "secure",
		username: "@secure",
	},
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

export function HighlightHub() {
	return (
		<div className="relative flex h-[300px] md:h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
			<Marquee pauseOnHover className="[--duration:20s]">
				{firstRow.map((review) => (
					<h1
						className="text-center text-4xl font-bold text-orange-500 md:text-7xl leading-7"
						key={review.username}
					>
						{review.name}
					</h1>
				))}
			</Marquee>
			<Marquee reverse pauseOnHover className="[--duration:20s]">
				{secondRow.map((review) => (
					<h1
						className="text-center text-4xl font-bold text-blue-500 md:text-7xl leading-7"
						key={review.username}
					>
						{review.name}
					</h1>
				))}
			</Marquee>
			<div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background" />
			<div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background" />
		</div>
	);
}
