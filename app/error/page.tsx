export default function ErrorPage() {
	return (
		<>
			<main className="grid my-12 place-items-center bg-white px-6 lg:px-8">
				<div className="mx-auto max-w-prose">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
						We apologize
					</h1>
					<p className="mt-6 text-base leading-7 text-gray-600">
						{`Thank you for your recent order with us. We're sorry to inform you
            that we encountered an issue processing your order. Our team is
            currently investigating the issue and we will provide an update as
            soon as possible.`}
					</p>
					<p className="mt-6 text-base leading-7 text-gray-600">
						{`We understand how frustrating this can be and we apologize for any
            inconvenience caused. We're working hard to resolve the issue as
            quickly as we can and ensure that your order is processed
            successfully.`}
					</p>

					<p className="mt-6 text-base leading-7 text-gray-600">
						{`If you have any questions or concerns about your order, please don't
            hesitate to contact us at`}{" "}
						<a
							href="mailto:amit@tapasom.com"
							className="leading-6 text-red-600"
						>
							amit@tapasom.com
						</a>
						. Our team is always here to assist you and provide any information
						you need.
					</p>

					<p className="mt-6 text-base leading-7 text-gray-600">
						Once again, we apologize for the inconvenience and appreciate your
						patience and understanding.
					</p>
				</div>
			</main>
		</>
	);
}
