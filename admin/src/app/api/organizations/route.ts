// Resources
import { auth } from "@/auth";
import z from "zod";
import { prisma, omit } from "@/lib/utility";

// Definitions
import { type Organization } from "@/generated/prisma";
import { type Result } from "@/lib/definitions";

// Definitions
export type OrganizationsResponse = Readonly<
  Omit<Organization, "employees" | "userBase" | "useCase" | "apiKey">
>;

// Schemas
export const createOrg = z.object({
  name: z
    .string("You must provide the name of the organization.")
    .min(3, "The name must be at least 3 characters.")
    .max(20),
  summary: z
    .string("You must provide a summary.")
    .min(3, "The summary must be at least 3 characters.")
    .max(50, "The summary must be under 50 characters."),
  useCase: z
    .string()
    .max(100, "The use-case must be under 100 characters.")
    .optional(),
});

/**
 * Fetches organizations.
 */
export async function GET(): Result<OrganizationsResponse[]> {
  // Fetch the current session and validate it.
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return new Response("Unauthorized.", { status: 401 });

  // Return all of the user's organizations.
  return Response.json(
    (
      await prisma.organization.findMany({
        where: {
          OR: [
            { ownerId: session.user.id },
            { agents: { some: { id: session.user.id } } },
          ],
        },
      })
    ).map((org) => omit(org, ["employees", "userBase", "useCase", "apiKey"]))
  );
}

/**
 * Creates an organization.
 */
export async function POST(req: Request): Result<OrganizationsResponse> {
  // Fetch the current session and validate it.
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return new Response("Unauthorized.", { status: 401 });

  // Fetch request body and validate it.
  const data = (await req.json()) as z.infer<typeof createOrg>;
  if (!createOrg.safeParse(data).success)
    return new Response("Invalid body parameters.", { status: 413 });

  // Make sure there are no organization already with that name.
  const exists = await prisma.organization.findUnique({
    where: { name: data.name },
  });
  if (exists)
    return new Response(
      `An organization with the name '${exists.name}' already exists.`,
      { status: 500 }
    );

  // Create new entry if all checks pass.
  const newOrg = await prisma.organization.create({
    data: {
      ...data,
      ownerId: session.user.id,
    },
  });

  return Response.json(
    omit(newOrg, ["useCase", "userBase", "employees", "apiKey"])
  ); // Return new organization information.
}
