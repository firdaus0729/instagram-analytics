import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { InstagramAccount } from "@/models/InstagramAccount";

// GET: Get all influencers (for admin approval)
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const influencers = await User.find({ role: "influencer" })
    .sort({ createdAt: -1 })
    .limit(100);

  const results = [];
  for (const influencer of influencers) {
    const profile = await InfluencerProfile.findOne({ user: influencer._id });
    const instagramAccount = await InstagramAccount.findOne({ user: influencer._id });

    results.push({
      id: influencer._id.toString(),
      email: influencer.email,
      name: influencer.name,
      isApproved: influencer.isApproved,
      createdAt: influencer.createdAt,
      profile: profile
        ? {
            category: profile.category,
            location: profile.location,
            isPublic: profile.isPublic
          }
        : null,
      instagram: instagramAccount
        ? {
            username: instagramAccount.username,
            followersCount: instagramAccount.followersCount
          }
        : null
    });
  }

  return NextResponse.json({ influencers: results });
}

// PUT: Approve/reject influencer
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const body = await req.json();
  const { influencerId, isApproved } = body;

  if (!influencerId || typeof isApproved !== "boolean") {
    return NextResponse.json(
      { error: "influencerId and isApproved are required" },
      { status: 400 }
    );
  }

  const influencer = await User.findByIdAndUpdate(
    influencerId,
    { isApproved },
    { new: true }
  );

  if (!influencer) {
    return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
  }

  // If approved, make profile public
  if (isApproved) {
    await InfluencerProfile.findOneAndUpdate(
      { user: influencer._id },
      { isPublic: true },
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true, influencer });
}

