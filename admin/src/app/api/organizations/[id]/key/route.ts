// Resources
import { auth } from "@/auth";
import { getOrg, prisma } from "@/lib/utility";
import { v7 as uuid } from "uuid";

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

/**
 * Regenerate the API key.
 */
export async function PATCH(
  _: Request,
  ctx: RouteContext<"/api/organizations/[id]">
) {
  const session = await auth(); // Fetch the session.

  // Validate the permissions and fetch the organization.
  const org = await getOrg(session, ctx, "owner");
  if (!("name" in org)) return org;

  // Update API key.
  const updated = await prisma.organization.update({
    where: {
      id: org.id,
    },
    data: {
      apiKey: uuid(),
    },
  });

  return new Response(updated.apiKey); // Return new API key.
}
