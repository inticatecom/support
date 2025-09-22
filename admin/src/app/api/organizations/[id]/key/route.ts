// Resources
import { auth } from "@/auth";
import { getOrg } from "@/lib/utility";

/**
 * Fetches the currently set API key.
 */
export async function GET(
  _: Request,
  ctx: RouteContext<"/api/organizations/[id]">
) {
  const session = await auth(); // Fetch the session.

  // Validate the permissions and fetch the organization.
  const org = await getOrg(session, ctx, "owner");
  if (!("name" in org)) return org;

  return new Response(org.apiKey); // Return the API key to the user if all checks pass.
}
