import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.LONG_LIVED_TOKEN_SECRET}`;
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const accounts = await InstagramAccount.find({});

  const results: Array<{ accountId: string; success: boolean }> = [];

  for (const account of accounts) {
    try {
      const body = JSON.stringify({
        instagramAccountId: account._id.toString()
      });
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      const res = await fetch(`${baseUrl}/api/instagram/sync/all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });

      results.push({ accountId: account._id.toString(), success: res.ok });
    } catch {
      results.push({ accountId: account._id.toString(), success: false });
    }
  }

  return NextResponse.json({ success: true, results });
}


