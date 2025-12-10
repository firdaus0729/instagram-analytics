import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramMedia } from "@/models/InstagramMedia";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const accountIds = searchParams.get("accountIds");
  
  if (!accountIds) {
    return NextResponse.json({
      campaignReach: 0,
      avgEngagement: 0,
      totalFollowers: 0,
      influencerCount: 0
    });
  }

  const ids = accountIds.split(",").filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({
      campaignReach: 0,
      avgEngagement: 0,
      totalFollowers: 0,
      influencerCount: 0
    });
  }

  // Get all accounts
  const accounts = await InstagramAccount.find({
    _id: { $in: ids }
  });

  if (accounts.length === 0) {
    return NextResponse.json({
      campaignReach: 0,
      avgEngagement: 0,
      totalFollowers: 0,
      influencerCount: 0
    });
  }

  // Calculate total followers (campaign reach potential)
  const totalFollowers = accounts.reduce(
    (sum, acc) => sum + (acc.followersCount || 0),
    0
  );

  // Get recent media from all accounts (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentMedia = await InstagramMedia.find({
    instagramAccount: { $in: ids },
    timestamp: { $gte: thirtyDaysAgo }
  });

  // Calculate average engagement rate
  let totalEngagement = 0;
  let mediaWithEngagement = 0;

  for (const media of recentMedia) {
    const likes = media.likeCount || 0;
    const comments = media.commentsCount || 0;
    const shares = media.shareCount || 0;
    const saves = media.savedCount || 0;
    const engagement = likes + comments + shares + saves;

    // Find the account for this media to get follower count
    const account = accounts.find(
      (acc) => acc._id.toString() === media.instagramAccount.toString()
    );

    if (account && account.followersCount && account.followersCount > 0) {
      const engagementRate = (engagement / account.followersCount) * 100;
      totalEngagement += engagementRate;
      mediaWithEngagement++;
    }
  }

  const avgEngagement = mediaWithEngagement > 0 
    ? totalEngagement / mediaWithEngagement 
    : 0;

  return NextResponse.json({
    campaignReach: totalFollowers,
    avgEngagement: Math.round(avgEngagement * 100) / 100, // Round to 2 decimals
    totalFollowers,
    influencerCount: accounts.length,
    mediaCount: recentMedia.length
  });
}

