import { cookies } from "next/headers";
import "server-only";

export type Role = "admin" | "user" | null;

/** Read role from cookie (demo auth). Replace with NextAuth later. */
export async function getRole(): Promise<Role> {
  const jar = await cookies(); // Next 16: async
  const v = jar.get("role")?.value;
  return v === "admin" || v === "user" ? v : null;
}
