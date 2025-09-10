// Resources
import { type Metadata } from "next";

// Components
import Login from "./Login";

// Metadata
export const metadata: Metadata = {
  title: "Login",
};

/**
 * The login page server component that renders the client login page.
 */
export default function LoginPage() {
  return <Login />;
}
