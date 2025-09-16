// Components
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Main route, mainly used for redirecting user based on their authentication status.
 */
export default async function Home() {
  // Hooks
  const session = await auth();

  return session?.user ? redirect("/dashboard") : redirect("/auth/login");
}
