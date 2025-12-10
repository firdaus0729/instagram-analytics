import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { User } from "@/models/User";

/**
 * Utility endpoint to make all influencer profiles public and approve all influencers (for testing)
 * Only accessible by admin
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  // Make all profiles public
  const profileResult = await InfluencerProfile.updateMany(
    {},
    { isPublic: true }
  );

  // Approve all influencer users
  const userResult = await User.updateMany(
    { role: "influencer" },
    { isApproved: true }
  );

  return NextResponse.json({
    success: true,
    message: `Made ${profileResult.modifiedCount} profiles public and approved ${userResult.modifiedCount} influencers`
  });
}

