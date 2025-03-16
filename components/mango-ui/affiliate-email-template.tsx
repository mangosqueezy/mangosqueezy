import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";
import * as React from "react";

const AffiliateEmailTemplate = (props: { affiliateLink: string }) => {
	const { affiliateLink } = props;

	return (
		<Html>
			<Head />
			<Preview>
				Thank you for promoting our products! Here's your affiliate link.
			</Preview>
			<Tailwind>
				<Body className="bg-gray-100 font-sans">
					<Container className="mx-auto py-[20px] px-[12px]">
						<Section className="bg-white rounded-lg shadow-sm overflow-hidden">
							{/* Header */}
							<Section className="bg-orange-600 px-[24px] py-[20px]">
								<Heading className="text-[24px] font-bold text-white m-0">
									Thank You For Your Partnership!
								</Heading>
							</Section>

							{/* Main Content */}
							<Section className="px-[24px] py-[32px]">
								<Text className="text-[16px] leading-[24px] text-gray-700">
									Dear Affiliate Partner,
								</Text>

								<Text className="text-[16px] leading-[24px] text-gray-700">
									We wanted to take a moment to express our sincere gratitude
									for promoting our products. Your support has been instrumental
									in helping us grow our business and reach new customers.
								</Text>

								<Text className="text-[16px] leading-[24px] text-gray-700">
									Thanks to partners like you, we've seen significant growth in
									our customer base. We value your continued support and want to
									ensure you're maximizing your commission potential.
								</Text>

								<Section className="bg-orange-50 border-l-4 border-orange-600 p-[16px] my-[24px]">
									<Text className="text-[16px] font-medium text-gray-800 m-0">
										Here's your personal affiliate link to share with your
										network:
									</Text>
									<Text className="text-[14px] text-orange-600 font-medium mt-[8px] mb-0 break-all">
										{affiliateLink}
									</Text>
								</Section>

								<Text className="text-[16px] leading-[24px] text-gray-700">
									Remember, you earn a commission on every purchase made through
									your link. The more you share, the more you earn!
								</Text>

								<Section className="text-center mt-[32px]">
									<Button
										className="bg-orange-600 text-white font-bold py-[12px] px-[24px] rounded-md no-underline text-center box-border"
										href={affiliateLink}
									>
										Start Sharing Now
									</Button>
								</Section>

								<Section className="mt-[32px] border-t border-gray-200 pt-[24px]">
									<Heading className="text-[18px] font-bold text-gray-800 mt-0 mb-[16px]">
										Tips to Maximize Your Commissions:
									</Heading>
									<ul className="pl-[24px] m-0">
										<li className="text-[16px] text-gray-700 mb-[8px]">
											Share your link on social media platforms
										</li>
										<li className="text-[16px] text-gray-700 mb-[8px]">
											Include it in your email newsletters
										</li>
										<li className="text-[16px] text-gray-700 mb-[8px]">
											Create content showcasing our products
										</li>
										<li className="text-[16px] text-gray-700">
											Recommend products to friends and family
										</li>
									</ul>
								</Section>
							</Section>

							{/* Footer */}
							<Section className="bg-gray-50 px-[24px] py-[20px] text-center">
								<Text className="text-[14px] text-gray-600 m-0">
									If you have any questions about our affiliate program, please
									contact our support team.
								</Text>
								<Text className="text-[14px] text-gray-600 mt-[8px] mb-0">
									© {new Date().getFullYear()} Tapasom. All rights reserved.
								</Text>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

AffiliateEmailTemplate.PreviewProps = {
	affiliateLink: "",
};

export default AffiliateEmailTemplate;
