export default function Page() {
	return (
		<div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
			<main className="grid my-12 place-items-center bg-white px-6 lg:px-8">
				<div className="mx-auto max-w-prose">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
						Thank you!!
					</h1>
					<p className="mt-6 text-base leading-7 text-gray-600">
						Thank you for your recent purchase with us! We hope you are enjoying
						your product and that it is meeting your needs.{" "}
					</p>
					<p className="mt-6 text-base leading-7 text-gray-600">
						{`Your support means a lot to us and we appreciate your trust in us.
            If you have any questions or concerns about your purchase, please
            don't hesitate to contact us. Our team is always here to assist you.`}
					</p>

					<p className="mt-6 text-base leading-7 text-gray-600">
						Thank you again for choosing us. We look forward to serving you
						again soon!
					</p>
				</div>
			</main>
		</div>
	);
}
