import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { InstagramAccount } from "@/models/InstagramAccount";
import { SyncLog } from "@/models/SyncLog";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(`sync_all_${user._id.toString()}`);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: limiter.retryAfter },
      { status: 429 }
    );
  }

  const { instagramAccountId } = (await req.json().catch(() => ({}))) as {
    instagramAccountId?: string;
  };

  if (!instagramAccountId) {
    return NextResponse.json(
      { error: "instagramAccountId is required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const account = await InstagramAccount.findOne({
    _id: instagramAccountId,
    user: user._id
  });

  if (!account) {
    return NextResponse.json(
      { error: "Instagram account not found" },
      { status: 404 }
    );
  }

  const syncLog = await SyncLog.create({
    instagramAccount: account._id,
    syncType: "all",
    status: "success",
    startedAt: new Date()
  });

  try {
    const body = JSON.stringify({ instagramAccountId });

    const [profileRes, mediaRes, insightsRes] = await Promise.all([
      fetch(new URL("/api/instagram/sync/profile", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      }),
      fetch(new URL("/api/instagram/sync/media", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      }),
      fetch(new URL("/api/instagram/sync/insights", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      })
    ]);

    const ok = profileRes.ok && mediaRes.ok && insightsRes.ok;

    syncLog.status = ok ? "success" : "partial";
    syncLog.finishedAt = new Date();
    await syncLog.save();

    if (!ok) {
      return NextResponse.json(
        { error: "One or more sync operations failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    syncLog.status = "failed";
    syncLog.finishedAt = new Date();
    syncLog.errorMessage = err instanceof Error ? err.message : "Unknown error";
    await syncLog.save();

    return NextResponse.json(
      { error: "Failed to sync all" },
      { status: 500 }
    );
  }
}


