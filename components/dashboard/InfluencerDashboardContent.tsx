"use client";

import { useState, useEffect } from "react";
import { CollaborationRequest } from "./CollaborationRequest";
import { BarChartSimple } from "@/components/charts/BarChartSimple";

interface AnalyticsData {
  account: {
    id: string;
    username: string;
  };
  overview: {
    metrics: {
      followerCount?: number;
      engagementRateByFollowers?: number;
      avgReach?: number;
      postingFrequencyPerWeek?: number;
    };
    growthSeries: Array<{ date: string; reach?: number; impressions?: number }>;
    topMedia: Array<{
      id: string;
      caption?: string;
      engagementRate: number;
      likeCount?: number;
      commentsCount?: number;
      mediaType: string;
    }>;
    audience?: Record<string, number>;
  };
}

// Mock collaboration requests
const mockCollaborations = [
  {
    id: "1",
    brand: "IRANI CHAI",
    campaign: "Café Promotion Video",
    description: "Propose a 2-minute café promotion video highlighting signature chai and bun maska",
    offer: "$1,150",
    status: "awaiting" as const
  },
  {
    id: "2",
    brand: "GLOWUP NATURALS",
    campaign: "Vitamin C Serum Launch",
    description: "Influencer briefing next Tuesday.",
    offer: "$1,200",
    status: "awaiting" as const
  }
];

export function InfluencerDashboardContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collaborations, setCollaborations] = useState(mockCollaborations);
  const [userName] = useState("Priyanshi Sharma");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const accountsRes = await fetch(`${baseUrl}/api/instagram/accounts`, {
          cache: "no-store"
        });
        if (!accountsRes.ok) {
          setData(null);
          setLoading(false);
          return;
        }
        const accounts = (await accountsRes.json()) as Array<{
          id: string;
          username: string;
        }>;
        if (!accounts.length) {
          setData(null);
          setLoading(false);
          return;
        }

        const instagramAccountId = accounts[0].id;
        const overviewRes = await fetch(
          `${baseUrl}/api/instagram/analytics/overview?instagramAccountId=${instagramAccountId}&days=30`,
          { cache: "no-store" }
        );
        if (!overviewRes.ok) {
          setData(null);
          setLoading(false);
          return;
        }
        const overview = await overviewRes.json();
        setData({ account: accounts[0], overview });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const followers = data?.overview.metrics.followerCount || 30000;
  const engagement = data?.overview.metrics.engagementRateByFollowers || 52.0;
  const avgReach = data?.overview.metrics.avgReach || 28400;

  const handleAccept = (id: string) => {
    setCollaborations((prev) =>
      prev.map((collab) =>
        collab.id === id ? { ...collab, status: "accepted" as const } : collab
      )
    );
  };

  const handleDecline = (id: string) => {
    setCollaborations((prev) => prev.filter((collab) => collab.id !== id));
  };

  // Calculate top performing format
  const topFormat = data?.overview.topMedia.reduce((acc, media) => {
    acc[media.mediaType] = (acc[media.mediaType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topFormatName = topFormat
    ? Object.entries(topFormat).sort((a, b) => b[1] - a[1])[0]?.[0] || "Reels"
    : "Reels";

  // Audience data for highlights
  const audienceData = data?.overview.audience || {};
  const audienceHighlights = [
    { label: "Bangalore", value: audienceData["Bangalore"] || 35 },
    { label: "Mumbai", value: audienceData["Mumbai"] || 22 },
    { label: "Delhi", value: audienceData["Delhi"] || 18 },
    { label: "Hyderabad", value: audienceData["Hyderabad"] || 12 },
    { label: "Other metros", value: audienceData["Other"] || 13 }
  ];

  // Content performance data
  const contentPerformance = [
    { format: "Reels", avgReach: 28400, saves: 960, completion: 74 },
    { format: "Carousels", avgReach: 19600, saves: 680, completion: 62 },
    { format: "Stories", avgReach: 15800, saves: 410, completion: 68 }
  ];

  // Monthly reach growth (last 6 months)
  const monthlyGrowth = data?.overview.growthSeries.slice(-6) || [];
  const growthData = monthlyGrowth.map((item, i) => ({
    label: `M${i + 1}`,
    value: Math.round(item.reach || item.impressions || 0)
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-purple-600">JustInfluence</div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {data && (
                <>
                  <button
                    onClick={async () => {
                      try {
                        const accountId = data.account.id;
                        const res = await fetch(
                          `/api/instagram/analytics/export?instagramAccountId=${accountId}&format=json&days=30`
                        );
                        if (res.ok) {
                          const jsonData = await res.json();
                          const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
                            type: "application/json"
                          });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `analytics-${data.account.username}-${new Date().toISOString().split("T")[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } else {
                          const error = await res.json().catch(() => ({ error: "Export failed" }));
                          alert(`Export failed: ${error.error || "Unknown error"}`);
                        }
                      } catch (error) {
                        console.error("Export error:", error);
                        alert("Failed to export analytics. Please try again.");
                      }
                    }}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Export Analytics
                  </button>
                  <span>|</span>
                </>
              )}
              <a
                href="/dashboard/influencer/profile"
                className="text-purple-600 hover:text-purple-700"
              >
                Edit Profile
              </a>
              <span>|</span>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/auth/login";
                }}
                className="text-purple-600 hover:text-purple-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Top Cards Row */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {/* Your creator snapshot */}
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
            <h3 className="mb-2 text-lg font-semibold">Your creator snapshot</h3>
            <p className="mb-4 text-sm opacity-90">
              Keep an eye on collaboration requests, audience growth, and high-performing content.
            </p>
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50">
              Browse brand briefs
            </button>
          </div>

          {/* Social health */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Social health</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                Audience sentiment steady at 4.7★
              </li>
              <li>Top-performing format: {topFormatName} (avg reach {avgReach.toLocaleString()})</li>
              <li>Peak posting window: Thu & Fri - 7-9 PM</li>
            </ul>
          </div>

          {/* Collaboration pipeline */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Collaboration pipeline</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>New requests this week: {collaborations.filter((c) => c.status === "awaiting").length}</li>
              <li>Campaigns in progress: 2 beauty, 1 wellness</li>
              <li>Avg offer value: $1,050</li>
            </ul>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-600">Followers</div>
            <div className="mt-2 text-3xl font-bold text-purple-600">
              {loading ? "..." : followers.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-600">Engagement</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {loading ? "..." : engagement.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-600">Primary Platform</div>
            <div className="mt-2 text-3xl font-bold text-purple-600">Instagram</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-600">Niche</div>
            <div className="mt-2 text-3xl font-bold text-purple-600">Food & Lifestyle</div>
          </div>
        </div>

        {/* Recent Collaboration Requests */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent collaboration requests</h2>
              <p className="mt-1 text-sm text-slate-600">Respond quickly to secure premium campaigns.</p>
            </div>
            <button className="rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50">
              View all briefs
            </button>
          </div>
          <div className="space-y-4">
            {collaborations.map((collab) => (
              <CollaborationRequest
                key={collab.id}
                brand={collab.brand}
                campaign={collab.campaign}
                description={collab.description}
                offer={collab.offer}
                status={collab.status}
                onAccept={() => handleAccept(collab.id)}
                onDecline={() => handleDecline(collab.id)}
              />
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Audience Highlights */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Audience highlights</h3>
            <div className="space-y-3">
              {audienceHighlights.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-medium text-slate-900">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-purple-600"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Ideas */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Content ideas</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• 24-hour café crawl series featuring Irani breakfasts</li>
              <li>• Behind-the-scenes chai brewing ritual with café staff</li>
              <li>• Recipe reel: {userName.split(" ")[0]} recreates Irani bun maska at home</li>
            </ul>
          </div>

          {/* Content Performance Snapshot */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Content performance snapshot</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2 text-left text-slate-600">Format</th>
                    <th className="pb-2 text-right text-slate-600">Avg Reach</th>
                    <th className="pb-2 text-right text-slate-600">Saves</th>
                    <th className="pb-2 text-right text-slate-600">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {contentPerformance.map((item) => (
                    <tr key={item.format} className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-900">{item.format}</td>
                      <td className="py-2 text-right text-slate-700">
                        {item.avgReach.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-slate-700">{item.saves}</td>
                      <td className="py-2 text-right text-slate-700">{item.completion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Reach Growth */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Monthly reach growth</h3>
            {growthData.length > 0 ? (
              <BarChartSimple data={growthData} />
            ) : (
              <div className="flex items-end justify-between gap-2">
                {[60, 75, 55, 85, 70, 90].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-purple-600"
                    style={{ height: `${height}%`, minHeight: "40px" }}
                  ></div>
                ))}
              </div>
            )}
            <p className="mt-4 text-sm text-slate-600">
              Consistent upward trend over the past six months powered by recipe Reels and
              lifestyle content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
