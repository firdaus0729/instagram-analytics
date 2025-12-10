import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramMedia } from "@/models/InstagramMedia";
import { calculateEngagementRate } from "@/lib/analytics";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const userId = params.id;

  // Get user
  const user = await User.findById(userId);
  if (!user || user.role !== "influencer") {
    return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
  }

  // Get profile
  const profile = await InfluencerProfile.findOne({ user: user._id });
  if (!profile || !profile.isPublic) {
    return NextResponse.json({ error: "Profile not public" }, { status: 404 });
  }

  // Get Instagram account
  const instagramAccount = await InstagramAccount.findOne({ user: user._id });
  if (!instagramAccount) {
    return NextResponse.json({ error: "Instagram account not connected" }, { status: 404 });
  }

  // Get recent media (sample posts)
  const recentMedia = await InstagramMedia.find({
    instagramAccount: instagramAccount._id
  })
    .sort({ timestamp: -1 })
    .limit(6);

  // Calculate engagement rate
  const engagementRate = await calculateEngagementRate(
    instagramAccount._id.toString(),
    "followers"
  );

  return NextResponse.json({
    influencer: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isApproved: user.isApproved
    },
    profile: {
      category: profile.category,
      location: profile.location,
      bio: profile.bio,
      pricing: profile.pricing,
      contactEmail: profile.contactEmail,
      contactWhatsApp: profile.contactWhatsApp,
      website: profile.website
    },
    instagram: {
      username: instagramAccount.username,
      profilePictureUrl: instagramAccount.profilePictureUrl,
      followersCount: instagramAccount.followersCount,
      followsCount: instagramAccount.followsCount,
      engagementRate: engagementRate || 0
    },
    samplePosts: recentMedia.map((media) => ({
      id: media._id.toString(),
      mediaUrl: media.mediaUrl,
      caption: media.caption,
      likeCount: media.likeCount,
      commentsCount: media.commentsCount,
      mediaType: media.mediaType,
      timestamp: media.timestamp
    }))
  });
}

