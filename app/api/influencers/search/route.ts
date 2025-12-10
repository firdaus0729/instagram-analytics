import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { InstagramAccount } from "@/models/InstagramAccount";
import { calculateEngagementRate } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const minFollowers = searchParams.get("minFollowers");
  const maxFollowers = searchParams.get("maxFollowers");
  const minEngagement = searchParams.get("minEngagement");
  const maxEngagement = searchParams.get("maxEngagement");
  const search = searchParams.get("search");

  // Build query - only show public profiles from approved users
  const profileQuery: any = { isPublic: true };
  if (category) profileQuery.category = category;
  if (location) profileQuery.location = { $regex: location, $options: "i" };

  const profiles = await InfluencerProfile.find(profileQuery).populate("user");

  // Filter by Instagram metrics
  const results = [];
  const skippedReasons: Record<string, number> = {
    notApproved: 0,
    noInstagram: 0,
    followerFilter: 0,
    engagementFilter: 0,
    searchFilter: 0
  };

  for (const profile of profiles) {
    const user = profile.user as any;
    
    // Only show approved influencers
    if (!user.isApproved) {
      skippedReasons.notApproved++;
      continue;
    }

    const instagramAccount = await InstagramAccount.findOne({
      user: user._id
    });

    // If no Instagram account, skip (they need to connect Instagram first)
    if (!instagramAccount) {
      skippedReasons.noInstagram++;
      continue;
    }

    // Filter by followers
    const followers = instagramAccount.followersCount || 0;
    if (minFollowers && minFollowers !== "" && followers < parseInt(minFollowers)) {
      skippedReasons.followerFilter++;
      continue;
    }
    if (maxFollowers && maxFollowers !== "" && !isNaN(parseInt(maxFollowers)) && followers > parseInt(maxFollowers)) {
      skippedReasons.followerFilter++;
      continue;
    }

    // Filter by engagement
    const engagementRate = await calculateEngagementRate(
      instagramAccount._id.toString(),
      "followers"
    );
    if (minEngagement && minEngagement !== "" && (engagementRate || 0) < parseFloat(minEngagement)) {
      skippedReasons.engagementFilter++;
      continue;
    }
    if (maxEngagement && maxEngagement !== "" && !isNaN(parseFloat(maxEngagement)) && (engagementRate || 0) > parseFloat(maxEngagement)) {
      skippedReasons.engagementFilter++;
      continue;
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const usernameMatch = instagramAccount.username?.toLowerCase().includes(searchLower);
      const nameMatch = (profile.user as any).name?.toLowerCase().includes(searchLower);
      const bioMatch = profile.bio?.toLowerCase().includes(searchLower);
      if (!usernameMatch && !nameMatch && !bioMatch) {
        skippedReasons.searchFilter++;
        continue;
      }
    }

    results.push({
      id: (profile.user as any)._id.toString(),
      name: (profile.user as any).name,
      username: instagramAccount.username,
      profilePictureUrl: instagramAccount.profilePictureUrl,
      followersCount: followers,
      engagementRate: engagementRate || 0,
      category: profile.category,
      location: profile.location,
      bio: profile.bio,
      pricing: profile.pricing,
      hasInstagram: true, // All results have Instagram (filtered above)
      isVerified: true, // Instagram connection = verified
      accountType: instagramAccount.accountType
    });
  }

  // Priority sorting: Instagram users first, then by followers
  results.sort((a, b) => {
    // Instagram users always come first
    if (a.hasInstagram && !b.hasInstagram) return -1;
    if (!a.hasInstagram && b.hasInstagram) return 1;
    // Then sort by followers (descending)
    return b.followersCount - a.followersCount;
  });

  // Add debug info in development
  const response: any = { influencers: results };
  if (process.env.NODE_ENV === "development") {
    response.debug = {
      totalProfiles: profiles.length,
      skippedReasons,
      totalResults: results.length
    };
  }

  return NextResponse.json(response);
}

