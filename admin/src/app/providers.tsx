"use client";
// Definitions
import { Children } from "@/lib/definitions";

// Components
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { OrganizationProvider } from "@/context/OrganizationContext";

// Variables
const queryClient = new QueryClient();

/**
 * A component for rendering all of the providers needed for third party libraries.
 */
export default function Providers({ children }: Children) {
  return (
    <SessionProvider>
      <OrganizationProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </OrganizationProvider>
    </SessionProvider>
  );
}
