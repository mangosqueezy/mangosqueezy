import type { Pipelines } from "@prisma/client";
import { getUser } from "../../actions";
import Overview from "./components/overview";

export const revalidate = 0;

export default async function PipelinePage() {
	const user = await getUser();
	const pipelines = user?.pipelines;

	return <Overview pipelines={pipelines as Pipelines[]} userId={user?.id} />;
}
