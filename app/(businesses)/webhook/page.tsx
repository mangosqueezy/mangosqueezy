import { getUser } from "../actions";
import SvixAppPortalEmbed from "./app-portal";

export default async function SvixEmbed() {
  const user = await getUser();

  return <SvixAppPortalEmbed svix_consumer_app_id={user?.svix_consumer_app_id} />;
}
