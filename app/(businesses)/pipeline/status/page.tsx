import type { Pipelines } from "@prisma/client";
import { getUser } from "../../actions";

export default async function PipelinePage() {
	const user = await getUser();
	const pipelines = user?.pipelines;

	return (
		<>
			<h1 className="text-xl font-semibold text-gray-900">Pipelines</h1>
			<ul className="divide-y divide-gray-100">
				{pipelines?.map((pipeline: Pipelines) => (
					<li
						key={pipeline.id}
						className="flex items-center justify-between gap-x-6 py-5"
					>
						<div className="min-w-0">
							<div className="flex items-start gap-x-3">
								<p className="text-sm font-semibold leading-6 text-gray-500">
									{`Product Id - ${pipeline.product_id}`}
								</p>
								<p className="text-orange-700 bg-orange-50 ring-orange-600/20 mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset">
									{pipeline.remark}
								</p>
							</div>

							<div className="mt-1 flex items-center gap-x-2 text-md leading-5 text-gray-900">
								<p className="whitespace-nowrap">{`Prompt - ${pipeline.prompt}`}</p>
							</div>
						</div>
					</li>
				))}
			</ul>
		</>
	);
}
