import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { getAccountOverview, getTopMedia, getGrowthSeries, getAudienceBreakdown } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(`analytics_overview_${user._id.toString()}`);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: limiter.retryAfter },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const instagramAccountId = searchParams.get("instagramAccountId");
  const days = Number(searchParams.get("days") || "30");

  if (!instagramAccountId) {
    return NextResponse.json(
      { error: "instagramAccountId is required" },
      { status: 400 }
    );
  }

  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const [overview, topMedia, growthSeries, audience] = await Promise.all([
      getAccountOverview(instagramAccountId, { from, to }),
      getTopMedia(instagramAccountId, { from, to }, 10),
      getGrowthSeries(instagramAccountId, { from, to }),
      getAudienceBreakdown(instagramAccountId)
    ]);

    return NextResponse.json({
      account: {
        id: overview.account._id.toString(),
        username: overview.account.username,
        profilePictureUrl: overview.account.profilePictureUrl,
        followersCount: overview.account.followersCount,
        accountType: overview.account.accountType
      },
      metrics: overview.metrics,
      topMedia: topMedia.map((item) => ({
        id: item.media.mediaId,
        caption: item.media.caption,
        mediaType: item.media.mediaType,
        mediaUrl: item.media.mediaUrl,
        permalink: item.media.permalink,
        likeCount: item.media.likeCount,
        commentsCount: item.media.commentsCount,
        reach: item.media.reach,
        impressions: item.media.impressions,
        engagementRate: item.engagementRate,
        timestamp: item.media.timestamp
      })),
      growthSeries,
      audience
    });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load analytics overview" },
      { status: 500 }
    );
  }
}


