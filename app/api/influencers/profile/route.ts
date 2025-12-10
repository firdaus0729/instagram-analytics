import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { InstagramAccount } from "@/models/InstagramAccount";

// GET: Get current user's profile
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "influencer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const profile = await InfluencerProfile.findOne({ user: user._id });
  const instagramAccount = await InstagramAccount.findOne({ user: user._id });

  return NextResponse.json({
    profile: profile || null,
    instagramAccount: instagramAccount
      ? {
          username: instagramAccount.username,
          followersCount: instagramAccount.followersCount,
          profilePictureUrl: instagramAccount.profilePictureUrl,
          accountType: instagramAccount.accountType
        }
      : null
  });
}

// PUT: Update profile
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "influencer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const body = await req.json();
  const { category, location, bio, pricing, contactEmail, contactWhatsApp, website, isPublic } =
    body;

  const profile = await InfluencerProfile.findOneAndUpdate(
    { user: user._id },
    {
      category,
      location,
      bio,
      pricing,
      contactEmail,
      contactWhatsApp,
      website,
      isPublic: isPublic !== undefined ? isPublic : true
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, profile });
}

