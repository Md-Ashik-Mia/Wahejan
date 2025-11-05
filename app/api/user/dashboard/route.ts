import { NextResponse } from "next/server";

export async function GET() {
  // TODO: fetch real data from your backend here.
  // Return empty to demo fallback to FAKE data:
  return NextResponse.json({});
}
