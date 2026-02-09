import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        env: {
            NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "SET" : "MISSING",
            API_BASE: process.env.NEXT_PUBLIC_API_BASE_URL ? "SET" : "MISSING",
            NODE_ENV: process.env.NODE_ENV
        }
    });
}
