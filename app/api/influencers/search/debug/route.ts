import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { InstagramAccount } from "@/models/InstagramAccount";

/**
 * Debug endpoint to see why influencers aren't showing up
 * GET /api/influencers/search/debug
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  // Get all influencer users
  const allInfluencers = await User.find({ role: "influencer" });
  
  const debugInfo = [];

  for (const influencer of allInfluencers) {
    const profile = await InfluencerProfile.findOne({ user: influencer._id });
    const instagramAccount = await InstagramAccount.findOne({ user: influencer._id });

    const issues = [];
    if (!profile) {
      issues.push("❌ No InfluencerProfile exists");
    } else {
      if (!profile.isPublic) {
        issues.push("❌ Profile is not public (isPublic: false)");
      }
    }

    if (!influencer.isApproved) {
      issues.push("❌ User is not approved (isApproved: false)");
    }

    if (!instagramAccount) {
      issues.push("❌ No Instagram account connected");
    }

    const status = issues.length === 0 ? "✅ Visible" : "❌ Not visible";

    debugInfo.push({
      email: influencer.email,
      name: influencer.name,
      status,
      issues,
      hasProfile: !!profile,
      isPublic: profile?.isPublic ?? false,
      isApproved: influencer.isApproved ?? false,
      hasInstagram: !!instagramAccount,
      instagramUsername: instagramAccount?.username || "N/A"
    });
  }

  return NextResponse.json({
    totalInfluencers: allInfluencers.length,
    visibleCount: debugInfo.filter(i => i.status === "✅ Visible").length,
    notVisibleCount: debugInfo.filter(i => i.status === "❌ Not visible").length,
    influencers: debugInfo
  });
}

