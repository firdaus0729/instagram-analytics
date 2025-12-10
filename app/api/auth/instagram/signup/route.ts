import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramMedia } from "@/models/InstagramMedia";
import { InstagramInsight } from "@/models/InstagramInsight";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { createSession } from "@/lib/auth";
import { generateCompleteMockInstagramData } from "@/lib/mock-instagram-data";
import { randomBytes } from "crypto";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const useMockData = process.env.ENABLE_DEMO_MODE === "true";

    if (useMockData) {
      // Use mock Instagram data
      console.log("Using mock Instagram data for signup");
      const mockData = generateCompleteMockInstagramData();

      // Create user
      const user = await User.create({
        email,
        password,
        name: mockData.account.name,
        role: "influencer",
        isVerified: true,
        isApproved: false // Needs admin approval
      });

      // Create influencer profile
      await InfluencerProfile.create({
        user: user._id,
        isPublic: false // Not public until approved
      });

      // Create Instagram account
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days

      const instagramAccount = await InstagramAccount.findOneAndUpdate(
        { instagramUserId: mockData.account.id },
        {
          user: user._id,
          instagramUserId: mockData.account.id,
          username: mockData.account.username,
          accountType: "BUSINESS",
          biography: mockData.account.biography,
          profilePictureUrl: mockData.account.profilePictureUrl,
          followersCount: mockData.account.followersCount,
          followsCount: mockData.account.followsCount,
          accessToken: `mock_token_${randomBytes(16).toString("hex")}`,
          longLivedToken: `mock_long_token_${randomBytes(16).toString("hex")}`,
          tokenExpiresAt: expiresAt
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Populate mock media
      for (const media of mockData.media) {
        await InstagramMedia.findOneAndUpdate(
          { mediaId: media.id },
          {
            instagramAccount: instagramAccount._id,
            mediaId: media.id,
            mediaType: media.mediaType,
            mediaUrl: media.mediaUrl,
            permalink: media.permalink,
            caption: media.caption,
            likeCount: media.likeCount,
            commentsCount: media.commentsCount,
            shareCount: media.sharesCount,
            savedCount: media.savesCount,
            timestamp: new Date(media.timestamp)
          },
          { upsert: true, new: true }
        );
      }

      // Populate mock insights
      const allInsights = [
        ...mockData.insights.reach.map(i => ({ ...i, metric: "reach", period: "day" as const })),
        ...mockData.insights.impressions.map(i => ({ ...i, metric: "impressions", period: "day" as const })),
        ...mockData.insights.profileViews.map(i => ({ ...i, metric: "profile_views", period: "day" as const })),
        ...mockData.insights.websiteClicks.map(i => ({ ...i, metric: "website_clicks", period: "day" as const }))
      ];

      for (const insight of allInsights) {
        await InstagramInsight.findOneAndUpdate(
          {
            instagramAccount: instagramAccount._id,
            metric: insight.metric,
            date: new Date(insight.endTime),
            period: insight.period
          },
          {
            instagramAccount: instagramAccount._id,
            metric: insight.metric,
            period: insight.period,
            value: insight.value,
            date: new Date(insight.endTime)
          },
          { upsert: true, new: true }
        );
      }

      // Populate audience demographics
      for (const ageGender of mockData.demographics.ageGender) {
        await InstagramInsight.findOneAndUpdate(
          {
            instagramAccount: instagramAccount._id,
            metric: "audience_age_gender",
            date: new Date(),
            period: "lifetime"
          },
          {
            instagramAccount: instagramAccount._id,
            metric: "audience_age_gender",
            period: "lifetime",
            value: 0,
            breakdown: {
              [ageGender.ageRange]: {
                male: ageGender.male,
                female: ageGender.female
              }
            },
            date: new Date()
          },
          { upsert: true, new: true }
        );
      }

      console.log("Mock Instagram data saved to MongoDB");

      // Create session
      await createSession(user);

      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isApproved: user.isApproved
        }
      });
    } else {
      // Real Instagram OAuth flow
      // Store email and password in session/cookie for later use
      const state = randomBytes(16).toString("hex");
      const loginUrl = `${getBaseUrl()}/api/auth/instagram/login?state=${state}`;
      
      // Return JSON with redirect URL instead of server-side redirect
      // This allows the frontend to handle the redirect properly
      const res = NextResponse.json({
        success: true,
        redirect: loginUrl,
        requiresOAuth: true
      });
      
      // Store email and password in cookie (temporary, for OAuth callback)
      res.cookies.set("instagram_signup_email", email, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 600 // 10 minutes
      });
      
      // Store password temporarily (will be hashed when user is created)
      res.cookies.set("instagram_signup_password", password, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 600 // 10 minutes
      });
      
      res.cookies.set("iap_oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 600
      });

      return res;
    }
  } catch (error) {
    console.error("Instagram signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

