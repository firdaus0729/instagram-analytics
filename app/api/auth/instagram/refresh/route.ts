import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";
import { refreshLongLivedToken } from "@/lib/instagram";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { instagramAccountId } = (await req.json().catch(() => ({}))) as {
    instagramAccountId?: string;
  };

  if (!instagramAccountId) {
    return NextResponse.json(
      { error: "instagramAccountId is required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const account = await InstagramAccount.findOne({
    _id: instagramAccountId,
    user: user._id
  });

  if (!account || !account.longLivedToken) {
    return NextResponse.json(
      { error: "Instagram account not found or no long-lived token" },
      { status: 404 }
    );
  }

  try {
    const refreshed = await refreshLongLivedToken(account.longLivedToken);
    account.longLivedToken = refreshed.access_token;
    account.tokenExpiresAt = new Date(
      Date.now() + refreshed.expires_in * 1000
    );
    await account.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}


