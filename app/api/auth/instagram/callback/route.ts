import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { exchangeCodeForShortLivedToken, exchangeShortForLongLivedToken } from "@/lib/instagram";
import { User } from "@/models/User";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramMedia } from "@/models/InstagramMedia";
import { InstagramInsight } from "@/models/InstagramInsight";
import { InfluencerProfile } from "@/models/InfluencerProfile";
import { getCurrentUser, createSession } from "@/lib/auth";
import { generateCompleteMockInstagramData } from "@/lib/mock-instagram-data";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");
  const demoMode = searchParams.get("demo") === "true" || process.env.ENABLE_DEMO_MODE === "true";
  const baseUrl = getBaseUrl();

  // Handle OAuth errors from Facebook
  if (error) {
    let errorMessage = error;
    
    // Provide more specific error messages
    if (errorReason) {
      errorMessage += ` (${errorReason})`;
    }
    if (errorDescription) {
      errorMessage += `: ${errorDescription}`;
    }
    
    // Handle specific error cases
    if (error === "access_denied") {
      errorMessage = "Access denied. Please grant the required permissions to connect your Instagram account.";
    } else if (errorReason === "user_denied") {
      errorMessage = "You denied the permission request. Please try again and grant the required permissions.";
    }
    
    return NextResponse.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(errorMessage)}`);
  }

  // If no code or state, it might be due to invalid scopes or user cancellation
  if (!code || !state) {
    // Check if there's an error reason that wasn't caught above
    if (errorReason) {
      let errorMessage = "Authentication failed";
      if (errorReason === "invalid_scope") {
        errorMessage = "Invalid Scopes: The requested permissions are not valid. Please check your Facebook app configuration in Developer Console. See /docs/troubleshooting-invalid-scopes.md for help.";
      } else {
        errorMessage = `Authentication failed: ${errorReason}`;
      }
      if (errorDescription) {
        errorMessage += ` - ${errorDescription}`;
      }
      return NextResponse.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(errorMessage)}`);
    }
    
    return NextResponse.redirect(
      `${baseUrl}/auth/error?error=${encodeURIComponent("Authentication was cancelled or failed. Please try again.")}`
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("iap_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${baseUrl}/auth/error?error=invalid_oauth_state`);
  }

  try {
    await connectToDatabase();

    let igBusiness: {
      id: string;
      name?: string;
      username: string;
      biography?: string;
      profile_picture_url?: string;
      followers_count?: number;
      follows_count?: number;
    };
    let longToken: { access_token: string; expires_in: number } | null = null;

    if (demoMode && code === "demo") {
      // Using mock data instead of real Instagram API
      console.log("Using mock Instagram data");
      const mockData = generateCompleteMockInstagramData();
      igBusiness = {
        id: mockData.account.id,
        name: mockData.account.name,
        username: mockData.account.username,
        biography: mockData.account.biography,
        profile_picture_url: mockData.account.profilePictureUrl,
        followers_count: mockData.account.followersCount,
        follows_count: mockData.account.followsCount
      };
    } else {
      // REAL MODE: Use actual Instagram API
      const shortToken = await exchangeCodeForShortLivedToken(code);
      longToken = await exchangeShortForLongLivedToken(
        shortToken.access_token
      );

      // Fetch the user's connected Instagram business account via Meta Graph API
      const igAccountRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account{name,username,biography,profile_picture_url,followers_count,follows_count}&access_token=${longToken.access_token}`,
        {
          signal: AbortSignal.timeout(30000) // 30 second timeout
        }
      );

      if (!igAccountRes.ok) {
        const text = await igAccountRes.text();
        throw new Error(`Failed to fetch Instagram account: ${text}`);
      }

      const igAccountData = (await igAccountRes.json()) as {
        data?: Array<{
          instagram_business_account?: {
            id: string;
            name?: string;
            username: string;
            biography?: string;
            profile_picture_url?: string;
            followers_count?: number;
            follows_count?: number;
          };
        }>;
      };

      const foundBusiness = igAccountData.data
        ?.map((page) => page.instagram_business_account)
        .find((acc) => acc && acc.username);

      if (!foundBusiness) {
        return NextResponse.redirect(
          `${baseUrl}/auth/error?error=instagram_business_or_creator_required`
        );
      }

      igBusiness = foundBusiness;
    }

    // Check if user is already logged in (connecting Instagram to existing account)
    let user = await getCurrentUser();
    
    if (!user) {
      // Check if there's a signup email/password from Instagram signup form
      const signupEmail = cookieStore.get("instagram_signup_email")?.value;
      const signupPassword = cookieStore.get("instagram_signup_password")?.value;
      
      if (signupEmail && signupPassword) {
        // User came from Instagram signup form - use their email
        user = await User.findOne({ email: signupEmail });
        if (!user) {
          user = await User.create({
            email: signupEmail,
            password: signupPassword,
            name: igBusiness.name ?? igBusiness.username,
            role: "influencer",
            isVerified: true,
            isApproved: false // Needs admin approval
          });
          
          // Create influencer profile
          await InfluencerProfile.create({
            user: user._id,
            isPublic: false // Not public until approved
          });
        }
        
        // Clear signup cookies
        cookieStore.delete("instagram_signup_email");
        cookieStore.delete("instagram_signup_password");
      } else {
        // No signup form - use fallback email
        const emailFallback = `${igBusiness.username}@instagram.local`;
        user = await User.findOne({ email: emailFallback });
        if (!user) {
          user = await User.create({
            email: emailFallback,
            name: igBusiness.name ?? igBusiness.username,
            role: "influencer",
            isVerified: true,
            isApproved: false // Needs admin approval
          });
          
          // Create influencer profile
          await InfluencerProfile.create({
            user: user._id,
            isPublic: false // Not public until approved
          });
        }
      }
    } else if (user.role !== "influencer") {
      return NextResponse.redirect(`${baseUrl}/auth/error?error=only_influencers_can_connect_instagram`);
    }

    // Create or update Instagram account
    const expiresAt = demoMode 
      ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days for demo
      : new Date(Date.now() + (longToken?.expires_in || 5184000) * 1000);

    const instagramAccount = await InstagramAccount.findOneAndUpdate(
      { instagramUserId: igBusiness.id },
      {
        user: user._id,
        instagramUserId: igBusiness.id,
        username: igBusiness.username,
        accountType: "BUSINESS",
        biography: igBusiness.biography,
        profilePictureUrl: igBusiness.profile_picture_url,
        followersCount: igBusiness.followers_count,
        followsCount: igBusiness.follows_count,
        accessToken: demoMode ? "demo_token" : (longToken?.access_token || ""),
        longLivedToken: demoMode ? "demo_long_token" : (longToken?.access_token || ""),
        tokenExpiresAt: expiresAt
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If using mock data, populate it
    if (demoMode) {
      console.log("Populating mock Instagram data into MongoDB");
      const mockData = generateCompleteMockInstagramData(igBusiness.username);

      // Save mock media
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

      // Save mock insights
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

      // Save audience demographics
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

      console.log("Mock data saved to MongoDB");
    } else {
      // REAL MODE: Fetch actual Instagram data
      console.log("Fetching real Instagram data from API");
      const token = longToken?.access_token;
      
      if (token) {
        try {
          // Fetch media
          let mediaUrl = `https://graph.facebook.com/v21.0/${igBusiness.id}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${token}&limit=100`;
          let mediaCount = 0;

          while (mediaUrl) {
            const resMedia = await fetch(mediaUrl, {
              signal: AbortSignal.timeout(30000)
            });
            
            if (!resMedia.ok) {
              const text = await resMedia.text();
              console.error(`Failed to fetch media: ${text}`);
              break; // Continue even if media fetch fails
            }

            const mediaData = (await resMedia.json()) as {
              data: Array<{
                id: string;
                caption?: string;
                media_type?: string;
                media_url: string;
                permalink?: string;
                timestamp: string;
                like_count?: number;
                comments_count?: number;
              }>;
              paging?: { next?: string };
            };

            for (const item of mediaData.data) {
              await InstagramMedia.findOneAndUpdate(
                { mediaId: item.id },
                {
                  instagramAccount: instagramAccount._id,
                  mediaId: item.id,
                  caption: item.caption,
                  mediaType: (item.media_type as "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REEL" | "STORY") ?? "UNKNOWN",
                  mediaUrl: item.media_url,
                  permalink: item.permalink,
                  likeCount: item.like_count,
                  commentsCount: item.comments_count,
                  timestamp: new Date(item.timestamp)
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
              mediaCount++;
            }

            mediaUrl = mediaData.paging?.next ?? "";
          }

          console.log(`Fetched ${mediaCount} media items`);

          // Fetch insights (last 30 days)
          const metrics = ["impressions", "reach", "saved", "engagement"];
          const insightsUrl = `https://graph.facebook.com/v21.0/${igBusiness.id}/insights?metric=${metrics.join(",")}&period=day&access_token=${token}`;
          
          const resInsights = await fetch(insightsUrl, {
            signal: AbortSignal.timeout(30000)
          });

          if (resInsights.ok) {
            const insightsData = (await resInsights.json()) as {
              data: Array<{
                name: string;
                period: string;
                values: Array<{
                  value: number | Record<string, number>;
                  end_time: string;
                }>;
              }>;
            };

            let insightsCount = 0;
            for (const metric of insightsData.data) {
              for (const value of metric.values) {
                const numericValue = typeof value.value === "number"
                  ? value.value
                  : Object.values(value.value).reduce((sum, v) => sum + (v || 0), 0);

                const breakdown = typeof value.value === "number" ? undefined : value.value;

                await InstagramInsight.findOneAndUpdate(
                  {
                    instagramAccount: instagramAccount._id,
                    metric: metric.name,
                    date: new Date(value.end_time),
                    period: metric.period
                  },
                  {
                    instagramAccount: instagramAccount._id,
                    metric: metric.name,
                    period: metric.period,
                    value: numericValue,
                    breakdown,
                    date: new Date(value.end_time)
                  },
                  { upsert: true, new: true }
                );
                insightsCount++;
              }
            }

            console.log(`Fetched ${insightsCount} insight records`);
          } else {
            const text = await resInsights.text();
            console.error(`Failed to fetch insights: ${text}`);
          }

          // Fetch audience demographics
          const audienceMetrics = ["audience_gender_age", "audience_country", "audience_city"];
          const audienceUrl = `https://graph.facebook.com/v21.0/${igBusiness.id}/insights?metric=${audienceMetrics.join(",")}&period=lifetime&access_token=${token}`;
          
          const resAudience = await fetch(audienceUrl, {
            signal: AbortSignal.timeout(30000)
          });

          if (resAudience.ok) {
            const audienceData = (await resAudience.json()) as {
              data: Array<{
                name: string;
                period: string;
                values: Array<{
                  value: number | Record<string, number>;
                  end_time: string;
                }>;
              }>;
            };

            for (const metric of audienceData.data) {
              for (const value of metric.values) {
                const breakdown = typeof value.value === "number" ? undefined : value.value;
                const numericValue = typeof value.value === "number"
                  ? value.value
                  : Object.values(value.value || {}).reduce((sum, v) => sum + (v || 0), 0);

                await InstagramInsight.findOneAndUpdate(
                  {
                    instagramAccount: instagramAccount._id,
                    metric: metric.name,
                    date: new Date(value.end_time),
                    period: metric.period
                  },
                  {
                    instagramAccount: instagramAccount._id,
                    metric: metric.name,
                    period: metric.period,
                    value: numericValue,
                    breakdown,
                    date: new Date(value.end_time)
                  },
                  { upsert: true, new: true }
                );
              }
            }

            console.log("Fetched audience demographics");
          } else {
            const text = await resAudience.text();
            console.error(`Failed to fetch audience demographics: ${text}`);
          }

          // Update last synced timestamp
          instagramAccount.lastSyncedAt = new Date();
          await instagramAccount.save();

          console.log("Real Instagram data saved to MongoDB");
        } catch (syncError) {
          console.error("Error fetching Instagram data:", syncError);
          // Don't fail the OAuth flow if data sync fails - user can sync later
        }
      }
    }

    await createSession(user);

    return NextResponse.redirect(`${baseUrl}/dashboard/influencer`);
  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    const errorMessage = err instanceof Error ? err.message : "oauth_failed";
    const isNetworkError = errorMessage.includes("timeout") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("fetch failed");
    
    if (isNetworkError) {
      return NextResponse.redirect(
        `${baseUrl}/auth/error?error=${encodeURIComponent("Network error: Could not connect to Facebook API. Please check your internet connection and try again.")}`
      );
    }
    
    return NextResponse.redirect(
      `${baseUrl}/auth/error?error=${encodeURIComponent(`OAuth failed: ${errorMessage}`)}`
    );
  }
}


