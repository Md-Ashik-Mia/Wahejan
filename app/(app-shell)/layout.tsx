// import Header from "@/components/Header";
// import SidebarClient from "@/components/SidebarClient";
// import { getRole } from "@/lib/auth";

// export const dynamic = "force-dynamic";

// export default async function AppShell({ children }: { children: React.ReactNode }) {
//   const role = await getRole();

//   return (
//     <html lang="en">
//       <body>
//         <Header />
//         <SidebarClient role={role} />
//         <main className="min-h-screen">{children}</main>
//       </body>
//     </html>
//   );
import AppShellClient from "./AppShellClient";

export const dynamic = "force-dynamic";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <AppShellClient>{children}</AppShellClient>;
}
