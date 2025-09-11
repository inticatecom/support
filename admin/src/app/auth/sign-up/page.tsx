// Resources
import { type Metadata } from "next";
import { auth } from "@/auth";

// Components
import SignUp from "./SignUp";
import { redirect } from "next/navigation";

// Metadata
export const metadata: Metadata = {
  title: "Sign Up",
};

/**
 * Server component to handle server-side metadata and then render client sign-up page component.
 */
export default async function SignUpPage() {
  // Hooks
  const session = await auth();
  if (session?.user) return redirect("/");

  return <SignUp />;
}
