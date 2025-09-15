// Resources
import { Metadata } from "next";

// Components
import Dashboard from "./Dashboard";

// Metadata
export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * The server-side page for the dashboard.
 */
export default async function DashboardPage() {
  return <Dashboard />;
}
