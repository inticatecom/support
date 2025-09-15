// Resources
import { Metadata } from "next";

// Components
import Inbox from "./Inbox";

// Metadata
export const metadata: Metadata = {
  title: "Inbox",
};

/**
 * The server-side inbox page for providing metadata before serving the client-side page.
 */
export default function InboxPage() {
  return <Inbox />;
}
