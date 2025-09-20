// Resources
import { auth } from "@/auth";
import { prisma, omit } from "@/lib/utility";

// Definitions
import { OrganizationsResponse } from "../route";
import { Result } from "@/lib/definitions";
import { Session } from "next-auth";
import { Organization } from "@/generated/prisma";

/**
 * Compares the user's permissions with the organization we are trying to access.
 * @param session The session in the request.
 * @param ctx The route's context.
 * @param perm The permission level to check. If not provided, this will default to 'agent'.
 * @returns Either the organization's information or a response containing the error details.
 */
async function hasPerm(
  session: Session | null,
  ctx: RouteContext<"/api/organizations/[id]">,
  perm?: "agent" | "owner"
): Promise<Organization | Response> {
  if (!session || !session.user)
    return new Response("Unauthorized.", { status: 401 }); // Make sure user is authorized.
  const { id } = await ctx.params; // Fetch the organization identifier from the route parameters.

  // Fetch organization entry in database.
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: { agents: true },
  });

  // Make sure organization actually exists with the provided identifier.
  if (!organization)
    return new Response(
      "Couldn't find organization with the provided identifier.",
      { status: 404 }
    );

  // Check user permissions to organization.
  if (perm === "agent") {
    if (
      organization.ownerId !== session.user.id &&
      organization.agents.some((agent) => agent.id !== session.user?.id)
    )
      return new Response("Unauthorized.", { status: 401 });
  } else {
    if (organization.ownerId !== session.user.id)
      return new Response("Unauthorized.", { status: 401 });
  }

  return organization; // Return organization information upon successful validation.
}

/**
 * Fetches an organization by it's identifier.
 */
export async function GET(
  _: Request,
  ctx: RouteContext<"/api/organizations/[id]">
): Result<OrganizationsResponse> {
  const data = await hasPerm(await auth(), ctx, "agent"); // Fetch and validate the user's permissions.
  if (!("name" in data)) return data; // Return an error to the user if the validation fails.

  return Response.json(
    omit(data, ["userBase", "employees", "useCase", "apiKey"])
  );
}

/**
 * Updates an organizations settings.
 */
export async function PATCH(
  _: Request,
  ctx: RouteContext<"/api/organizations/[id]">
): Result<boolean> {
  const data = await hasPerm(await auth(), ctx, "owner"); // Fetch and validate the user's permissions.
  if (!("name" in data)) return data; // Return an error to the user if the validation fails.

  return new Response("Will update organization settings soon.");
}
