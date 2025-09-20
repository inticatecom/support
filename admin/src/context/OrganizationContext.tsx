// Resources
import { createContext, useContext, useState } from "react";

// Definitions
import { Children } from "@/lib/definitions";
type OrgContextValue = {
  orgId: string | null;
  setOrgId: (id: string) => void;
};

// Variables
const Context = createContext<OrgContextValue | undefined>(undefined);

/**
 * Provider to allows currently selected organization to be synced between components.
 */
export function OrganizationProvider({ children }: Children) {
  // States
  const [orgId, setOrgId] = useState<string | null>(null);

  // Export
  return (
    <Context.Provider value={{ orgId, setOrgId }}>{children}</Context.Provider>
  );
}

/**
 * The context for the currently selected organization.
 */
export function useOrgContext() {
  // Hooks
  const context = useContext(Context);

  // Throw error is organization provider is not used.
  if (!context)
    throw new Error(
      "You must use the 'OrganizationProvider' provider to make use of the 'useOrgContext' hook."
    );

  return context; // Export Context
}
