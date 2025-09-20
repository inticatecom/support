"use client";
// Components
import { Page } from "@/components/View";

/**
 * The invite view for inviting users to the current organization.
 */
export default function Invite() {
  return (
    <Page title="Invite">
      <Page.Heading description="Invite users to the organization giving them access as an agent.">
        Invite
      </Page.Heading>
    </Page>
  );
}
