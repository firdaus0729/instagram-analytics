import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramMedia } from "@/models/InstagramMedia";
import { InstagramInsight } from "@/models/InstagramInsight";
import { InfluencerProfile } from "@/models/InfluencerProfile";

export async function GET() {
  try {
    await connectToDatabase();

    // Get statistics from MongoDB
    const totalUsers = await User.countDocuments();
    const normalSignupUsers = await User.countDocuments({
      $or: [
        { email: { $not: /@instagram\.local$/ } },
        { email: { $exists: true } }
      ]
    });
    const instagramConnectedUsers = await InstagramAccount.countDocuments();
    const totalMedia = await InstagramMedia.countDocuments();
    const totalInsights = await InstagramInsight.countDocuments();
    const totalProfiles = await InfluencerProfile.countDocuments();

    // Get sample data
    const sampleInstagramAccount = await InstagramAccount.findOne().lean();
    const sampleMedia = await InstagramMedia.findOne().lean();
    const sampleInsight = await InstagramInsight.findOne().lean();

    return NextResponse.json({
      statistics: {
        totalUsers,
        normalSignupUsers,
        instagramConnectedUsers,
        totalMedia,
        totalInsights,
        totalProfiles
      },
      sampleData: {
        instagramAccount: sampleInstagramAccount ? {
          username: sampleInstagramAccount.username,
          followersCount: sampleInstagramAccount.followersCount,
          hasToken: !!sampleInstagramAccount.longLivedToken
        } : null,
        media: sampleMedia ? {
          mediaType: sampleMedia.mediaType,
          likeCount: sampleMedia.likeCount,
          commentsCount: sampleMedia.commentsCount
        } : null,
        insight: sampleInsight ? {
          metric: sampleInsight.metric,
          value: sampleInsight.value,
          period: sampleInsight.period
        } : null
      }
    });
  } catch (error) {
    console.error("Failed to fetch comparison data:", error);
    return NextResponse.json(
      { error: "Failed to fetch comparison data" },
      { status: 500 }
    );
  }
}


