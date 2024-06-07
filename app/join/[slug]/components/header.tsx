import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import mangoImg from "../../../../public/mango.png";

export function Navigation() {
  return (
    <header className="relative flex h-[80px] min-h-[80px] items-center justify-between px-3">
      {/* Left */}
      <Link href="/" className="actionable flex h-8 items-center gap-1">
        <span className="text-base font-medium text-gray-600 dark:text-gray-400">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mangoImg.src} alt="@mangosqueezy" />
            <AvatarFallback>MS</AvatarFallback>
          </Avatar>
        </span>
        <span className="text-base font-medium text-gray-600 dark:text-gray-400">
          Mangosqueezy
        </span>
      </Link>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="mx-1 h-5 w-px bg-gray-200 transition dark:bg-gray-800" />

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/tapasomlabs/mangosqueezy"
            className="actionable flex h-8 w-8 items-center justify-center gap-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-800 dark:text-gray-400"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://twitter.com/amit_mirgal"
            className="actionable flex h-8 w-8 items-center justify-center gap-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
          >
            <svg
              className="h-7 w-7 text-black dark:text-gray-200"
              viewBox="0 0 1668.56 1221.19"
              xmlSpace="preserve"
            >
              <g id="layer1" transform="translate(52.390088,-25.058597)">
                <path
                  id="path1009"
                  fill="currentColor"
                  d="M283.94,167.31l386.39,516.64L281.5,1104h87.51l340.42-367.76L984.48,1104h297.8L874.15,558.3l361.92-390.99 h-87.51l-313.51,338.7l-253.31-338.7H283.94z M412.63,231.77h136.81l604.13,807.76h-136.81L412.63,231.77z"
                />
              </g>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
