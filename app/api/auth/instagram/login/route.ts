import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildInstagramLoginUrl } from "@/lib/instagram";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const providedState = searchParams.get("state");
    const state = providedState || randomBytes(16).toString("hex");

    // Check environment variables
    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    
    if (!appId) {
      console.error("META_APP_ID is not set in environment variables");
      return NextResponse.redirect(
        `/auth/error?error=${encodeURIComponent("META_APP_ID is not configured. Please check your .env.local file.")}`
      );
    }
    
    if (!redirectUri) {
      console.error("INSTAGRAM_REDIRECT_URI is not set in environment variables");
      return NextResponse.redirect(
        `/auth/error?error=${encodeURIComponent("INSTAGRAM_REDIRECT_URI is not configured. Please check your .env.local file.")}`
      );
    }
    const url = buildInstagramLoginUrl(state);
    
    console.log("Redirecting to Instagram OAuth:", url);

    const res = NextResponse.redirect(url);
    // In a production app, also persist the state server-side or in a cookie
    res.cookies.set("iap_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600
    });

    return res;
  } catch (error) {
    console.error("Instagram login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(
      `/auth/error?error=${encodeURIComponent(`Failed to initiate Instagram login: ${errorMessage}`)}`
    );
  }
}


