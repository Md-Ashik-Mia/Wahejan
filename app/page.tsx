// app/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // not logged in → go to login
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else {
    // default to user dashboard
    redirect("/user/dashboard");
  }
}
