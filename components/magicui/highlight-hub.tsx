import Marquee from "@/components/magicui/marquee";

const reviews = [
  {
    name: "open-source",
    username: "@open-source",
  },
  {
    name: "crypto",
    username: "@crypto",
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
    <div className="relative flex md:h-[500px] h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map(review => (
          <h1
            className="font-display text-center text-4xl font-bold tracking-regular text-orange-500 md:text-7xl md:leading-[5rem]"
            key={review.username}
          >
            {review.name}
          </h1>
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map(review => (
          <h1
            className="font-display text-center text-4xl font-bold tracking-regular text-blue-500 md:text-7xl md:leading-[5rem]"
            key={review.username}
          >
            {review.name}
          </h1>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
    </div>
  );
}
