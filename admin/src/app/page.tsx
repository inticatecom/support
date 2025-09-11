// Components
import { auth } from "@/auth";
import { Grid, SideBar } from "@/components/View";
import { redirect } from "next/navigation";

export default async function Home() {
  // Hooks
  const session = await auth();
  if (!session?.user) return redirect("/auth/login");

  return (
    <Grid>
      <SideBar />
      <h1>Dashboard</h1>
    </Grid>
  );
}
