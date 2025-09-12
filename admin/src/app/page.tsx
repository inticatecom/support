// Components
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // Hooks
  const session = await auth();
  if (!session?.user) {
    return redirect("/auth/login");
  } else {
    return redirect("/dashboard");
  }
}
