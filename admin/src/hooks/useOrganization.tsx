// Resources
import ky from "ky";

// Definitions
import { OrganizationResponse } from "../app/api/organizations/[id]/route";

// Hooks
import { useQuery } from "@tanstack/react-query";
import { useOrgContext } from "@/context/OrganizationContext";

/**
 * Fetches the currently selected organization and/or allows you to set the organization.
 * @param defaultId The default organization identifier.
 */
export function useOrganization(defaultId?: string) {
  // Hooks
  const { orgId, setOrgId } = useOrgContext();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      return await ky
        .get<OrganizationResponse>(`/api/organizations/${orgId}`)
        .json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!orgId,
  });

  if (defaultId) setOrgId(defaultId); // Set organization identifier if a default one is provided.

  // Export Data & Methods
  return {
    orgId,
    setOrgId,
    org: data ?? undefined,
    isLoading,
    error,
    refetch,
  };
}
