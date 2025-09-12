// Resources
import { auth } from "@/auth";
import { prisma } from "@/lib/utility";
import * as z from "zod";
import bcrypt from "bcryptjs";

// Variables
export const signUpSchema = z.object({
  name: z
    .string("Your name is required.")
    .min(3, "The name must be at least 3 characters."),
  email: z.email("Email must be of the valid format."),
  password: z
    .string("The password is required.")
    .min(8, "The password requires at least 8 characters."),
});

/**
 * Handles the creation of new accounts.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user)
      return new Response("Cannot create a new user whilst logged in.", {
        status: 500,
      });

    const data = (await req.json()) as unknown as z.infer<typeof signUpSchema>;

    if (!signUpSchema.safeParse(data).success)
      return new Response("Invalid body data.", {
        status: 400,
      });

    const emailTaken = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailTaken)
      return new Response("Email already taken.", { status: 409 });

    const hashedPass = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPass,
      },
    });

    return Response.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (e) {
    console.error(e);
    return new Response("Internal server error.", { status: 500 });
  }
}
