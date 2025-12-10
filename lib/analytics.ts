import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramMedia } from "@/models/InstagramMedia";
import { InstagramInsight } from "@/models/InstagramInsight";
import { connectToDatabase } from "./db";
import { Types } from "mongoose";

export interface DateRange {
  from: Date;
  to: Date;
}

export async function getAccountOverview(
  instagramAccountId: string,
  range: DateRange
) {
  await connectToDatabase();
  const account = await InstagramAccount.findById(instagramAccountId);
  if (!account) throw new Error("Instagram account not found");

  const medias = await InstagramMedia.find({
    instagramAccount: new Types.ObjectId(instagramAccountId),
    timestamp: { $gte: range.from, $lte: range.to }
  }).sort({ timestamp: -1 });

  const totalLikes = medias.reduce((sum, m) => sum + (m.likeCount || 0), 0);
  const totalComments = medias.reduce(
    (sum, m) => sum + (m.commentsCount || 0),
    0
  );
  const totalReach = medias.reduce((sum, m) => sum + (m.reach || 0), 0);
  const totalImpressions = medias.reduce(
    (sum, m) => sum + (m.impressions || 0),
    0
  );

  const postsCount = medias.length || 1;
  const followerCount = account.followersCount || 1;

  const engagementRateByFollowers =
    ((totalLikes + totalComments) / (followerCount * postsCount)) * 100;

  const engagementRateByReach =
    totalReach > 0 ? ((totalLikes + totalComments) / totalReach) * 100 : 0;

  const avgReach = totalReach / postsCount;
  const avgImpressions = totalImpressions / postsCount;

  const days =
    (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24) || 1;
  const postingFrequencyPerWeek = (postsCount / days) * 7;

  return {
    account,
    metrics: {
      followerCount,
      postsCount,
      engagementRateByFollowers,
      engagementRateByReach,
      avgReach,
      avgImpressions,
      postingFrequencyPerWeek
    }
  };
}

export async function getTopMedia(
  instagramAccountId: string,
  range: DateRange,
  limit = 10
) {
  await connectToDatabase();
  const medias = await InstagramMedia.find({
    instagramAccount: new Types.ObjectId(instagramAccountId),
    timestamp: { $gte: range.from, $lte: range.to }
  });

  const withEngagement = medias.map((m) => {
    const likes = m.likeCount || 0;
    const comments = m.commentsCount || 0;
    const reach = m.reach || 0;
    const engagementRate = reach > 0 ? ((likes + comments) / reach) * 100 : 0;
    return { media: m, engagementRate };
  });

  return withEngagement
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, limit);
}

export async function getGrowthSeries(
  instagramAccountId: string,
  range: DateRange
) {
  await connectToDatabase();
  const insights = await InstagramInsight.find({
    instagramAccount: new Types.ObjectId(instagramAccountId),
    metric: { $in: ["reach", "impressions"] },
    date: { $gte: range.from, $lte: range.to }
  }).sort({ date: 1 });

  const seriesMap = new Map<
    string,
    { date: string; reach?: number; impressions?: number }
  >();

  for (const insight of insights) {
    const key = insight.date.toISOString().substring(0, 10);
    const existing = seriesMap.get(key) || { date: key };
    if (insight.metric === "reach") {
      existing.reach = insight.value;
    }
    if (insight.metric === "impressions") {
      existing.impressions = insight.value;
    }
    seriesMap.set(key, existing);
  }

  return Array.from(seriesMap.values());
}

export async function getAudienceBreakdown(instagramAccountId: string) {
  await connectToDatabase();
  const latestDemographic = await InstagramInsight.findOne({
    instagramAccount: new Types.ObjectId(instagramAccountId),
    metric: { $in: ["audience_gender_age", "audience_city", "audience_country"] }
  }).sort({ date: -1 });

  return latestDemographic?.breakdown || {};
}

export async function calculateEngagementRate(
  instagramAccountId: string,
  method: "followers" | "reach" = "followers"
): Promise<number> {
  await connectToDatabase();
  
  const account = await InstagramAccount.findById(instagramAccountId);
  if (!account) return 0;

  // Get recent media (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentMedia = await InstagramMedia.find({
    instagramAccount: new Types.ObjectId(instagramAccountId),
    timestamp: { $gte: thirtyDaysAgo }
  });

  if (recentMedia.length === 0) return 0;

  const totalLikes = recentMedia.reduce((sum, m) => sum + (m.likeCount || 0), 0);
  const totalComments = recentMedia.reduce((sum, m) => sum + (m.commentsCount || 0), 0);
  const totalEngagement = totalLikes + totalComments;

  if (method === "followers") {
    const followerCount = account.followersCount || 1;
    return (totalEngagement / (followerCount * recentMedia.length)) * 100;
  } else {
    const totalReach = recentMedia.reduce((sum, m) => sum + (m.reach || 0), 0);
    if (totalReach === 0) return 0;
    return (totalEngagement / totalReach) * 100;
  }
}


