// Resources
import { Metadata } from "next";

// Components
import CreateOrganization from "./CreateOrganization";

// Metadata
export const metadata: Metadata = {
  title: "Create Organization",
};

/**
 * The server-side page for creating organizations.
 */
export default function CreateOrganizationPage() {
  return <CreateOrganization />;
}
