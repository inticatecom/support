"use client";
// Components
import { Page } from "@/components/View";

// Hooks
import { useSession } from "next-auth/react";
import { useOrganization } from "../../hooks/useOrganization";

/**
 * The client-side page for the dashboard.
 */
export default function Dashboard() {
  // Hooks
  const session = useSession();
  const { org } = useOrganization();

  return (
    <Page title="Dashboard" loading={session.status === "loading"}>
      <h1 className="text-white font-semibold text-4xl">
        Welcome, {session.data?.user?.name}
      </h1>
      <p>{JSON.stringify(org)}</p>
    </Page>
  );
}
