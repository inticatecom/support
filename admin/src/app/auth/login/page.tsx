// Resources
import { type Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Components
import Login from "./Login";

// Metadata
export const metadata: Metadata = {
  title: "Login",
};

/**
 * The login page server component that renders the client login page.
 */
export default async function LoginPage() {
  // Hooks
  const session = await auth();
  if (session?.user) return redirect("/dashboard");

  return <Login />;
}
