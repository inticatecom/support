// Resources
import { auth } from "@/auth";
import { redirect } from "next/navigation";
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
  // Hooks
  const session = await auth();
  if (!session?.user) return redirect("/auth/login");

  return <Dashboard />;
}
