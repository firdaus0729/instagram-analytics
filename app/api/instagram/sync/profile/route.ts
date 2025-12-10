import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { InstagramAccount } from "@/models/InstagramAccount";
import { ensureValidLongLivedToken } from "@/lib/instagram";
import { SyncLog } from "@/models/SyncLog";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(`sync_profile_${user._id.toString()}`);
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
    syncType: "profile",
    status: "success",
    startedAt: new Date()
  });

  try {
    const token = await ensureValidLongLivedToken(account._id.toString());

    const resProfile = await fetch(
      `https://graph.facebook.com/v21.0/${account.instagramUserId}?fields=username,account_type,biography,profile_picture_url,followers_count,follows_count&access_token=${token}`
    );

    if (!resProfile.ok) {
      const text = await resProfile.text();
      throw new Error(`Failed to fetch profile: ${text}`);
    }

    const data = (await resProfile.json()) as {
      username: string;
      account_type?: string;
      biography?: string;
      profile_picture_url?: string;
      followers_count?: number;
      follows_count?: number;
    };

    account.username = data.username;
    account.accountType =
      (data.account_type as typeof account.accountType) ?? "UNKNOWN";
    account.biography = data.biography;
    account.profilePictureUrl = data.profile_picture_url;
    account.followersCount = data.followers_count;
    account.followsCount = data.follows_count;
    account.lastSyncedAt = new Date();
    await account.save();

    syncLog.status = "success";
    syncLog.finishedAt = new Date();
    await syncLog.save();

    return NextResponse.json({ success: true, account });
  } catch (err: unknown) {
    console.error(err);
    syncLog.status = "failed";
    syncLog.finishedAt = new Date();
    syncLog.errorMessage = err instanceof Error ? err.message : "Unknown error";
    await syncLog.save();

    return NextResponse.json(
      { error: "Failed to sync profile" },
      { status: 500 }
    );
  }
}


