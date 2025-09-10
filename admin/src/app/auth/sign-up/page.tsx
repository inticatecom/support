// Resources
import { type Metadata } from "next";

// Components
import SignUp from "./SignUp";

// Metadata
export const metadata: Metadata = {
  title: "Sign Up",
};

/**
 * Server component to handle server-side metadata and then render client sign-up page component.
 */
export default function SignUpPage() {
  return <SignUp />;
}
