import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";

export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const accounts = await InstagramAccount.find({ user: user._id }).sort({
    createdAt: -1
  });

  return NextResponse.json(
    accounts.map((a) => ({
      id: a._id.toString(),
      username: a.username,
      accountType: a.accountType,
      profilePictureUrl: a.profilePictureUrl,
      followersCount: a.followersCount
    }))
  );
}


