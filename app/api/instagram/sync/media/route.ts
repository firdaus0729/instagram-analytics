import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramMedia } from "@/models/InstagramMedia";
import { ensureValidLongLivedToken } from "@/lib/instagram";
import { SyncLog } from "@/models/SyncLog";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(`sync_media_${user._id.toString()}`);
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
    syncType: "media",
    status: "success",
    startedAt: new Date()
  });

  try {
    const token = await ensureValidLongLivedToken(account._id.toString());

    let url = `https://graph.facebook.com/v21.0/${account.instagramUserId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${token}&limit=100`;

    let created = 0;

    while (url) {
      const resMedia = await fetch(url);
      if (!resMedia.ok) {
        const text = await resMedia.text();
        throw new Error(`Failed to fetch media: ${text}`);
      }

      const data = (await resMedia.json()) as {
        data: Array<{
          id: string;
          caption?: string;
          media_type?: string;
          media_url: string;
          permalink?: string;
          timestamp: string;
          like_count?: number;
          comments_count?: number;
        }>;
        paging?: { next?: string };
      };

      for (const item of data.data) {
        await InstagramMedia.findOneAndUpdate(
          { mediaId: item.id },
          {
            instagramAccount: account._id,
            mediaId: item.id,
            caption: item.caption,
            mediaType:
              (item.media_type as
                | "IMAGE"
                | "VIDEO"
                | "CAROUSEL_ALBUM"
                | "REEL"
                | "STORY") ?? "UNKNOWN",
            mediaUrl: item.media_url,
            permalink: item.permalink,
            likeCount: item.like_count,
            commentsCount: item.comments_count,
            timestamp: new Date(item.timestamp)
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        created += 1;
      }

      url = data.paging?.next ?? "";
    }

    account.lastSyncedAt = new Date();
    await account.save();

    syncLog.status = "success";
    syncLog.finishedAt = new Date();
    syncLog.meta = { created };
    await syncLog.save();

    return NextResponse.json({ success: true, created });
  } catch (err: unknown) {
    console.error(err);
    syncLog.status = "failed";
    syncLog.finishedAt = new Date();
    syncLog.errorMessage = err instanceof Error ? err.message : "Unknown error";
    await syncLog.save();

    return NextResponse.json(
      { error: "Failed to sync media" },
      { status: 500 }
    );
  }
}


