// Resources
import { auth } from "@/auth";
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

  return children;
}
