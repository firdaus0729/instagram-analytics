import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramInsight } from "@/models/InstagramInsight";
import { ensureValidLongLivedToken } from "@/lib/instagram";
import { SyncLog } from "@/models/SyncLog";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(`sync_insights_${user._id.toString()}`);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: limiter.retryAfter },
      { status: 429 }
    );
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

  if (!account) {
    return NextResponse.json(
      { error: "Instagram account not found" },
      { status: 404 }
    );
  }

  const syncLog = await SyncLog.create({
    instagramAccount: account._id,
    syncType: "insights",
    status: "success",
    startedAt: new Date()
  });

  try {
    const token = await ensureValidLongLivedToken(account._id.toString());

    const metrics = [
      "impressions",
      "reach",
      "saved",
      "engagement",
      "audience_gender_age",
      "audience_country",
      "audience_city"
    ];

    const url = `https://graph.facebook.com/v21.0/${account.instagramUserId}/insights?metric=${metrics.join(
      ","
    )}&period=day&access_token=${token}`;

    const resInsights = await fetch(url);
    if (!resInsights.ok) {
      const text = await resInsights.text();
      throw new Error(`Failed to fetch insights: ${text}`);
    }

    const data = (await resInsights.json()) as {
      data: Array<{
        name: string;
        period: string;
        values: Array<{
          value: number | Record<string, number>;
          end_time: string;
        }>;
      }>;
    };

    let created = 0;

    for (const metric of data.data) {
      for (const value of metric.values) {
        const numericValue =
          typeof value.value === "number"
            ? value.value
            : Object.values(value.value).reduce(
                (sum, v) => sum + (v || 0),
                0
              );

        const breakdown =
          typeof value.value === "number" ? undefined : value.value;

        await InstagramInsight.create({
          instagramAccount: account._id,
          metric: metric.name,
          period: metric.period,
          value: numericValue,
          breakdown,
          date: new Date(value.end_time)
        });

        created += 1;
      }
    }

    syncLog.status = "success";
    syncLog.finishedAt = new Date();
    syncLog.meta = { created };
    await syncLog.save();

    return NextResponse.json({ success: true, created });
  } catch (err: unknown) {
    console.error(err);
    syncLog.status = "failed";
    syncLog.finishedAt = new Date();
    syncLog.errorMessage = err instanceof Error ? err.message : "Unknown error";
    await syncLog.save();

    return NextResponse.json(
      { error: "Failed to sync insights" },
      { status: 500 }
    );
  }
}


