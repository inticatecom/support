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
      <Page.Heading description="Welcome. This is your personal dashboard for the currently selected organization.">
        {`Welcome, ${session.data?.user?.name}`}
      </Page.Heading>
      <p className="text-sm mt-5">{JSON.stringify(org)}</p>
    </Page>
  );
}
