import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) {
    return NextResponse.json([]);
  }

  const results = await InstagramAccount.find({
    username: { $regex: q, $options: "i" }
  })
    .sort({ followersCount: -1 })
    .limit(10);

  return NextResponse.json(
    results.map((a) => ({
      id: a._id.toString(),
      username: a.username,
      followersCount: a.followersCount,
      profilePictureUrl: a.profilePictureUrl,
      accountType: a.accountType
    }))
  );
}


