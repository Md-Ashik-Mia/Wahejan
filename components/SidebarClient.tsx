// "use client";
// import { adminNav } from "@/components/nav/adminNav";
// import { userNav } from "@/components/nav/userNav";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { FaRegArrowAltCircleRight } from "react-icons/fa";

// type Role = "admin" | "user" | null;

// export default function SidebarClient({ role }: { role: Role }) {
//   const router = useRouter();
//   const items = role === "admin" ? adminNav : userNav;

//   async function logout() {
//     await fetch("/api/auth/logout", { method: "POST" });
//     router.push("/login");
//   }

//   return (
//     <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-w)] z-50 bg-[#212121] border-r-2 border-gray-700/20">
//       <div className="h-[var(--header-h)] flex items-center justify-center px-4 text-4xl font-bold mt-17 mb gap-5">
//         <Image
//           src="/logo.svg"
//           alt="Profile"
//           width={40}
//           height={40}
//           className="rounded-full"
//         />
//         Verse AI
//       </div>
//       <nav className="flex flex-col justify-center items-center">
//         {items.map((i) => (
//           <Link href={i.href} key={i.href} className="w-52 h-14 text-xl rounded-xl hover:bg-black pt-2">
//             <div

//               className=" p-2 rounded flex gap-2.5  items-center   text-gray-400 hover:text-white "
//             >
//               <Image src={i.icon} alt={i.label} width={25} height={25} />
//              <span className="text-[17px] font-bold"> {i.label}</span>
//             </div>
//           </Link>
//         ))}

//         <div className="absolute bottom-4 left-0 right-0 px-3">
//           <button
//             onClick={logout}
//             className="text-xl w-56 h-14 font-medium py-2 rounded bg-linear-to-r from-[#0062FF] to-[#CA00AF] flex justify-center items-center gap-6  "
//           >
//             <FaRegArrowAltCircleRight /> Logout
//           </button>
//         </div>
//       </nav>
//     </aside>
//   );
// }
"use client";

import { adminNav } from "@/components/nav/adminNav";
import { userNav } from "@/components/nav/userNav";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaRegArrowAltCircleRight } from "react-icons/fa";

import { useSession } from "next-auth/react"

type Role = "admin" | "user" | null;

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SidebarClient() {
   const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const router = useRouter();
  const pathname = usePathname();
  const items = role === "admin" ? adminNav : userNav;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-w)] z-50 bg-[#212121] border-r-2 border-gray-700/20">
      <div className="h-[var(--header-h)] flex items-center justify-center py-20 px-4 font-bold gap-3">
        <Image src="/logo.svg" alt="Verse AI" width={36} height={36} />
        <span className="text-xl">Verse AI</span>
      </div>

      <nav className="flex flex-col items-center gap-1 pt-2">
        {items.map((i) => {
          // active if exact or nested under the item (e.g. /user/settings/profile)
          const active =
            pathname === i.href || pathname.startsWith(i.href + "/");

          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "w-52 h-12 rounded-xl transition",
                active ? "bg-black/70 shadow-inner" : "hover:bg-black/40"
              )}
            >
              <div
                className={cx(
                  "h-full px-3 rounded flex gap-3 items-center",
                  active ? "text-white" : "text-gray-400 hover:text-white"
                )}
              >
                <Image src={i.icon} alt={i.label} width={22} height={22} />
                <span className={cx("text-[15px] font-semibold flex-1")}>
                  {i.label}
                </span>

                {/* left border/indicator when active */}
                <span
                  className={cx(
                    "block h-6 w-1 rounded-full",
                    active ? "bg-[#3b82f6]" : "bg-transparent"
                  )}
                />
              </div>
            </Link>
          );
        })}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center px-3">
          <button
            onClick={logout}
            className="text-base w-56 h-12 font-medium rounded bg-gradient-to-r from-[#0062FF] to-[#CA00AF] flex justify-center items-center gap-2"
          >
            <FaRegArrowAltCircleRight className="text-lg" /> Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
