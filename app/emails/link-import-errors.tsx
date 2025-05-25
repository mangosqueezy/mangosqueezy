import { truncate } from "@/lib/utils";
import {
	Body,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Row,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

const MAX_ERROR_LINKS = 20;

export function LinksImportErrors({
	provider = "CSV",
	errorLinks = [
		{
			domain: "mangosqueezy",
			key: "123",
			error: "Failed to create campaign",
		},
		{
			domain: "mangosqueezy",
			key: "456",
			error: "Failed to create campaign",
		},
	],
}: {
	email: string;
	provider: "CSV" | "Bitly" | "Short.io" | "Rebrandly";
	errorLinks: {
		domain: string;
		key: string;
		error: string;
	}[];
}) {
	return (
		<Html>
			<Head />
			<Preview>Your campaigns have been imported</Preview>
			<Tailwind>
				<Body className="mx-auto my-auto bg-white font-sans">
					<Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
						<Heading className="mx-0 my-7 p-0 text-lg font-medium text-black">
							Some campaigns have failed to import
						</Heading>
						<Text className="text-sm leading-6 text-black">
							The following{" "}
							{Intl.NumberFormat("en-us").format(errorLinks.length)} campaigns
							failed to import into your mangosqueezy workspace.
						</Text>
						<Section>
							<Row className="pb-2">
								<Column align="left" className="text-sm text-neutral-500">
									Campaign
								</Column>
								<Column align="right" className="text-sm text-neutral-500">
									Error
								</Column>
							</Row>
							{errorLinks
								.slice(0, MAX_ERROR_LINKS)
								.map(({ domain, error }, index) => (
									<div key={`${domain}-${error}`}>
										<Row>
											<Column align="left" className="text-sm font-medium">
												{truncate(domain, 40)}
											</Column>
											<Column
												align="right"
												className="text-sm text-neutral-600"
												suppressHydrationWarning
											>
												{error}
											</Column>
										</Row>
										{index !== errorLinks.length - 1 && (
											<Hr className="my-2 w-full border border-neutral-200" />
										)}
									</div>
								))}
						</Section>
						{errorLinks.length > MAX_ERROR_LINKS && (
							<Section className="my-8 text-center">
								<Text className="text-sm leading-6 text-black">
									...and {errorLinks.length - MAX_ERROR_LINKS} more errors
								</Text>
							</Section>
						)}
						<Text className="text-sm leading-6 text-black">
							Please reply to this email for additional help with your CSV
							import.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default LinksImportErrors;
