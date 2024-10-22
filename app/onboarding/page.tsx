import { redirect } from "next/navigation";
import { getUser } from "../(businesses)/actions";
import ElegantOnboarding from "./components/onboarding";

export default async function Page() {
	const user = await getUser();

	if (user?.commission && user?.commission > 0) {
		redirect("/pipeline");
	}

	return (
		<ElegantOnboarding
			userId={user?.id as string}
			email={user?.email as string}
		/>
	);
}
