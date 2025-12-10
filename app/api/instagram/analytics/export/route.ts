import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";
import { getAccountOverview, getTopMedia, getGrowthSeries, getAudienceBreakdown } from "@/lib/analytics";

/**
 * Export analytics data as JSON
 * GET /api/instagram/analytics/export?instagramAccountId=xxx&format=json
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const instagramAccountId = searchParams.get("instagramAccountId");
  const format = searchParams.get("format") || "json";
  const days = parseInt(searchParams.get("days") || "30");

  if (!instagramAccountId) {
    return NextResponse.json(
      { error: "instagramAccountId is required" },
      { status: 400 }
    );
  }

  // Verify the account belongs to the user
  const account = await InstagramAccount.findById(instagramAccountId);
  if (!account || account.user.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Get analytics data
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  const [overview, topMedia, growthSeries, audience] = await Promise.all([
    getAccountOverview(instagramAccountId, { from, to }),
    getTopMedia(instagramAccountId, { from, to }, 10),
    getGrowthSeries(instagramAccountId, { from, to }),
    getAudienceBreakdown(instagramAccountId)
  ]);

  if (format === "json") {
    return NextResponse.json({
      account: {
        username: account.username,
        followersCount: account.followersCount,
        accountType: account.accountType
      },
      period: {
        days,
        startDate: from.toISOString(),
        endDate: to.toISOString()
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
      demographics: audience,
      exportedAt: new Date().toISOString()
    });
  }

  // CSV format (simplified)
  if (format === "csv") {
    const csv = [
      "Metric,Value",
      `Followers,${overview.metrics.followerCount}`,
      `Engagement Rate (Followers),${overview.metrics.engagementRateByFollowers.toFixed(2)}%`,
      `Engagement Rate (Reach),${overview.metrics.engagementRateByReach.toFixed(2)}%`,
      `Average Reach,${overview.metrics.avgReach.toFixed(0)}`,
      `Average Impressions,${overview.metrics.avgImpressions.toFixed(0)}`,
      `Total Posts,${overview.metrics.postsCount}`,
      `Posting Frequency (per week),${overview.metrics.postingFrequencyPerWeek.toFixed(2)}`
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${account.username}-${new Date().toISOString().split("T")[0]}.csv"`
      }
    });
  }

  return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}

