import { formatDate, pluralize, truncate } from "@/lib/utils";
import {
	Body,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Row,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

export function LinksImported({
	provider = "Bitly",
	count = 1020,
	campaigns = ["squ.zy"],
}: {
	email: string;
	provider: "Bitly" | "Short.io" | "Rebrandly" | "CSV";
	count: number;
	campaigns: string[];
}) {
	const campaignNames = campaigns.map((campaign) => {
		const [campaignName, createdAt] = campaign.split(" - ");
		return {
			campaign_name: campaignName,
			created_at: createdAt,
		};
	});

	return (
		<Html>
			<Head />
			<Preview>Your {provider} links have been imported</Preview>
			<Tailwind>
				<Body className="mx-auto my-auto bg-white font-sans">
					<Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
						<Heading className="mx-0 my-7 p-0 text-lg font-medium text-black">
							Your {provider} links have been imported
						</Heading>
						<Text className="text-sm leading-6 text-black">
							We have successfully{" "}
							<strong>
								imported {Intl.NumberFormat("en-us").format(count)} campaigns
							</strong>{" "}
							from {provider} into your mangosqueezy workspace, , for the{" "}
							{pluralize("campaign", campaignNames.length)}{" "}
							<strong>{campaignNames.join(", ")}</strong>.
						</Text>
						{campaignNames.length > 0 && (
							<Section>
								<Row className="pb-2">
									<Column align="left" className="text-sm text-neutral-500">
										Campaign
									</Column>
									<Column align="right" className="text-sm text-neutral-500">
										Created
									</Column>
								</Row>
								{campaignNames.map(({ campaign_name, created_at }, index) => (
									<div key={`${campaign_name}-${created_at}`}>
										<Row>
											<Column align="left" className="text-sm font-medium">
												{truncate(campaign_name, 40)}
											</Column>
											<Column
												align="right"
												className="text-sm text-neutral-600"
												suppressHydrationWarning
											>
												{formatDate(created_at)}
											</Column>
										</Row>
										{index !== campaigns.length - 1 && (
											<Hr className="my-2 w-full border border-neutral-200" />
										)}
									</div>
								))}
							</Section>
						)}
						{count > 5 && (
							<Section className="my-8">
								<Link
									className="rounded-lg bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
									href="https://mangosqueezy.com/campaigns"
								>
									View {Intl.NumberFormat("en-us").format(count - 5)} more
									campaigns
								</Link>
							</Section>
						)}
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default LinksImported;
