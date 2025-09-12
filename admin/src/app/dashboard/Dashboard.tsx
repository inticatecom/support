"use client";
// Components
import { Page } from "@/components/View";

// Hooks
import { useSession } from "next-auth/react";

/**
 * The client-side page for the dashboard.
 */
export default function Dashboard() {
  // Hooks
  const session = useSession();

  return (
    <Page loading={session.status === "loading"}>
      <h1 className="text-white font-semibold text-4xl">
        Welcome, {session.data?.user?.name}
      </h1>
    </Page>
  );
}
