"use client";
// Hooks
import { useOrganization } from "@/hooks/useOrganization";

// Components
import { Card, Page } from "@/components/View";
import { Input } from "@/components/Interaction";

/**
 * The invite view for inviting users to the current organization.
 */
export default function Invite() {
  // Hooks
  const { org } = useOrganization();

  return (
    <Page title="Invite">
      <Page.Heading description="Invite users to the organization giving them access as an agent.">
        Invite
      </Page.Heading>
      <div className="flex gap-5 mt-5">
        <div className="flex flex-col w-1/4">
          <h3 className="font-semibold text-xl mb-3">Invite Agents</h3>
          <Input placeholder="john@doe.com" />
        </div>
        <div className="flex-grow-1">
          <h3 className="font-semibold text-xl mb-3">Current Agents</h3>
          <div className="grid grid-cols-2 gap-3">
            {org && org.agents.length > 0 ? (
              org.agents.map((id, index) => (
                <Card key={index} className="p-3">
                  <h5 className="font-semibold">{id}</h5>
                </Card>
              ))
            ) : (
              <p className="text-lg text-white/70">
                No agents in organization.
              </p>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
