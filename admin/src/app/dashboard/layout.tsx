// Resources
import { auth } from "@/auth";
import { prisma } from "@/lib/utility";
import { redirect } from "next/navigation";

/**
 * Layout for dashboard-based routes to protect them from unauthenticated users.
 */
export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hooks
  const session = await auth();
  if (!session?.user) return redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organizations: true, ownedOrganizations: true },
  });
  if (user?.organizations.length === 0 && user?.ownedOrganizations.length === 0)
    return redirect("/create-organization");

  return children;
}
