export default function Page() {
	return (
		<>
			<main className="grid my-12 place-items-center bg-white px-6 lg:px-8">
				<div className="mx-auto max-w-prose">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
						We apologize
					</h1>
					<p className="mt-6 text-base leading-7 text-gray-600">
						{
							"Something went wrong. We apologize for the inconvenience. Please reach out to us"
						}
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
