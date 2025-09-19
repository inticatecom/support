// Resources
import { Metadata } from "next";

// Components
import Settings from "./Settings";

// Metadata
export const metadata: Metadata = {
  title: "Settings",
};

/**
 * The server-side component for the settings page.
 */
export default function SettingsPage() {
  return <Settings />;
}
