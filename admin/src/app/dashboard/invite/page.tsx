// Resources
import { Metadata } from "next";

// Components
import Invite from "./Invite";

// Metadata
export const metadata: Metadata = {
  title: "Invite",
};

/**
 * Server-side page for setting up metadata.
 */
export default function InvitePage() {
  return <Invite />;
}
