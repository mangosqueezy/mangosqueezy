import mangosqueezy from "@/assets/mangosqueezy-primary-logo.svg";
import {
	PlusGrid,
	PlusGridItem,
	PlusGridRow,
} from "@/components/mango-ui/plus-grid";
import Image from "next/image";
import { Button } from "./button";
import { Container } from "./container";
import { Gradient } from "./gradient";
import { Link } from "./link";
import { Subheading } from "./text";

function CallToAction() {
	return (
		<div className="relative pb-16 pt-20 text-center sm:py-24">
			<hgroup>
				<Subheading>Get started</Subheading>
				<p className="mt-6 text-3xl font-medium tracking-tight text-gray-950 sm:text-5xl">
					Ready to dive in?
					<br />
					Start your free trial today.
				</p>
			</hgroup>
			<p className="mx-auto mt-6 max-w-xs text-sm/6 text-gray-500">
				Get the cheat codes for selling and unlock your business&apos;s revenue
				potential.
			</p>
			<div className="mt-6">
				<Button className="w-full sm:w-auto" href="/login">
					Get started
				</Button>
			</div>
		</div>
	);
}

function SitemapHeading({ children }: { children: React.ReactNode }) {
	return <h3 className="text-sm/6 font-medium text-gray-950/50">{children}</h3>;
}

function SitemapLinks({ children }: { children: React.ReactNode }) {
	return <ul className="mt-6 space-y-4 text-sm/6">{children}</ul>;
}

function SitemapLink(props: React.ComponentPropsWithoutRef<typeof Link>) {
	return (
		<li>
			<Link
				{...props}
				className="font-medium text-gray-950 data-hover:text-gray-950/75"
			/>
		</li>
	);
}

function Sitemap() {
	return (
		<>
			<div>
				<SitemapHeading>Product</SitemapHeading>
				<SitemapLinks>
					<SitemapLink href="/pricing">Pricing</SitemapLink>
				</SitemapLinks>
			</div>
			<div>
				<SitemapHeading>Company</SitemapHeading>
				<SitemapLinks>
					<SitemapLink href="/terms">Terms of service</SitemapLink>
					<SitemapLink href="/privacy">Privacy policy</SitemapLink>
				</SitemapLinks>
			</div>
		</>
	);
}

function SocialIconX(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg viewBox="0 0 16 16" fill="currentColor" {...props}>
			<title>X</title>
			<path d="M12.6 0h2.454l-5.36 6.778L16 16h-4.937l-3.867-5.594L2.771 16H.316l5.733-7.25L0 0h5.063l3.495 5.114L12.6 0zm-.86 14.376h1.36L4.323 1.539H2.865l8.875 12.837z" />
		</svg>
	);
}

function SocialIconFacebook(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg viewBox="0 0 16 16" fill="currentColor" {...props}>
			<title>Facebook</title>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M16 8.05C16 3.603 12.418 0 8 0S0 3.604 0 8.05c0 4.016 2.926 7.346 6.75 7.95v-5.624H4.718V8.05H6.75V6.276c0-2.017 1.194-3.131 3.022-3.131.875 0 1.79.157 1.79.157v1.98h-1.008c-.994 0-1.304.62-1.304 1.257v1.51h2.219l-.355 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.95z"
			/>
		</svg>
	);
}

function SocialIconLinkedIn(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg viewBox="0 0 16 16" fill="currentColor" {...props}>
			<title>LinkedIn</title>
			<path d="M14.82 0H1.18A1.169 1.169 0 000 1.154v13.694A1.168 1.168 0 001.18 16h13.64A1.17 1.17 0 0016 14.845V1.15A1.171 1.171 0 0014.82 0zM4.744 13.64H2.369V5.996h2.375v7.644zm-1.18-8.684a1.377 1.377 0 11.52-.106 1.377 1.377 0 01-.527.103l.007.003zm10.075 8.683h-2.375V9.921c0-.885-.015-2.025-1.234-2.025-1.218 0-1.425.966-1.425 1.968v3.775H6.233V5.997H8.51v1.05h.032c.317-.601 1.09-1.235 2.246-1.235 2.405-.005 2.851 1.578 2.851 3.63v4.197z" />
		</svg>
	);
}

function SocialIconGithub(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg viewBox="0 0 16 16" fill="currentColor" {...props}>
			<title>GitHub</title>
			<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
		</svg>
	);
}

function SocialLinks() {
	return (
		<>
			<Link
				href="https://www.facebook.com/getmangosqueezy"
				target="_blank"
				aria-label="Visit us on Facebook"
				className="text-gray-950 data-hover:text-gray-950/75"
			>
				<SocialIconFacebook className="size-4" />
			</Link>
			<Link
				href="https://x.com/mangosqueezy"
				target="_blank"
				aria-label="Visit us on X"
				className="text-gray-950 data-hover:text-gray-950/75"
			>
				<SocialIconX className="size-4" />
			</Link>
			<Link
				href="https://www.linkedin.com/company/mangosqueezy/"
				target="_blank"
				aria-label="Visit us on LinkedIn"
				className="text-gray-950 data-hover:text-gray-950/75"
			>
				<SocialIconLinkedIn className="size-4" />
			</Link>
			<Link
				href="https://github.com/mangosqueezy/mangosqueezy"
				target="_blank"
				aria-label="Visit us on GitHub"
				className="text-gray-950 data-hover:text-gray-950/75"
			>
				<SocialIconGithub className="size-4" />
			</Link>
		</>
	);
}

function Copyright() {
	return (
		<div className="text-sm/6 text-gray-950">
			&copy; {new Date().getFullYear()} mangosqueezy.com
		</div>
	);
}

export function Footer() {
	return (
		<footer>
			<Gradient className="relative">
				<div className="absolute inset-2 rounded-4xl bg-white/80" />
				<Container>
					<CallToAction />
					<PlusGrid className="pb-16">
						<PlusGridRow>
							<div className="grid grid-cols-2 gap-y-10 pb-6 lg:grid-cols-6 lg:gap-8">
								<div className="col-span-2 flex">
									<PlusGridItem className="pt-6 lg:pb-6">
										<Image
											src={mangosqueezy}
											priority={false}
											width={100}
											height={100}
											className="h-6 w-full"
											alt=""
										/>
									</PlusGridItem>
								</div>
								<div className="col-span-2 grid grid-cols-2 gap-x-8 gap-y-12 lg:col-span-4 lg:grid-cols-subgrid lg:pt-6">
									<Sitemap />
								</div>
							</div>
						</PlusGridRow>
						<PlusGridRow className="flex justify-between">
							<div>
								<PlusGridItem className="py-3">
									<Copyright />
								</PlusGridItem>
							</div>
							<div className="flex">
								<PlusGridItem className="flex items-center gap-8 py-3">
									<SocialLinks />
								</PlusGridItem>
							</div>
						</PlusGridRow>
					</PlusGrid>
				</Container>
			</Gradient>
		</footer>
	);
}
