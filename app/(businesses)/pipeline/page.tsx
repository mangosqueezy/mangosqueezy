import { getUser } from "../actions";
import Flow from "./components/flow";
import "@xyflow/react/dist/style.css";

export default async function Post() {
	const user = await getUser();

	return <Flow products={user?.products} business_id={user?.id} />;
}
