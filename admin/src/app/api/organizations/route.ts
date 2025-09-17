// Resources
import { auth } from "@/auth";
import * as z from "zod";
import { prisma } from "@/lib/utility";

// Schemas
const createOrg = z.object({
  name: z.string().min(3).max(20),
  summary: z.string().min(3).max(50),
});

/**
 * Fetches organizations.
 */
export async function GET() {
  // Fetch the current session and validate it.
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return new Response("Unauthorized.", { status: 401 });

  // Return all of the user's organizations.
  return Response.json(
    await prisma.organization.findMany({ where: { ownerId: session.user.id } })
  );
}

/**
 * Creates an organization.
 */
export async function POST(req: Request) {
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
      `An organization with the name ${exists.name} already exists.`,
      { status: 500 }
    );

  // Create new entry if all checks pass.
  const newOrg = await prisma.organization.create({
    data: {
      ...data,
      ownerId: session.user.id,
    },
  });

  return Response.json(newOrg); // Return new organization information.
}
