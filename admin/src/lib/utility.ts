// Resources
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Definitions
import { PrismaClient, Organization } from "../generated/prisma";
import { HTTPError } from "ky";
import { Session } from "next-auth";

// Variables
const prismaGlobal = globalThis as unknown as { prisma: PrismaClient };

/**
 * Formats Tailwind classes.
 * @param inputs The classes.
 * @returns Thee formatted class.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Prisma client to interact with data stored in the database.
 */
export const prisma = prismaGlobal.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") prismaGlobal.prisma = prisma;

/**
 * Similar to the 'Omit' type, this function omits keys from objects.
 * @param obj The array.
 * @param keys A list of keys to remove from the array.
 * @returns The modified array.
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Fetches the reason of an HTTP error if one is provided.
 * @param e The error.
 * @returns The reason or a generic present 'Internal server error.'.
 */
export async function handleError(e: unknown): Promise<string> {
  if (e instanceof HTTPError) {
    return await e.response.text();
  } else {
    return "Internal server error.";
  }
}

/**
 * Compares the user's permissions with the organization we are trying to access.
 * @param session The session in the request.
 * @param ctx The route's context.
 * @param perm The permission level to check. If not provided, this will default to 'agent'.
 * @returns Either the organization's information or a response containing the error details.
 */
export async function getOrg(
  session: Session | null,
  ctx: RouteContext<"/api/organizations/[id]">,
  perm?: "agent" | "owner"
): Promise<(Omit<Organization, "agents"> & { agents: string[] }) | Response> {
  try {
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

    return {
      ...omit(organization, ["agents"]),
      ...{ agents: organization.agents.map((agent) => agent.id) },
    }; // Return organization information upon successful validation.
  } catch {
    return new Response("Internal server error.", { status: 500 });
  }
}
