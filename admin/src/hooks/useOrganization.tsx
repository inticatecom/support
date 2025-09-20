// Resources
import ky from "ky";

// Definitions
import { OrganizationsResponse } from "../app/api/organizations/route";

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

  // Hooks
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      return await ky
        .get<OrganizationsResponse>(`/api/organizations/${orgId}`)
        .json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!orgId,
  });

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
