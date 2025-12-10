"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ComparisonData {
  normalSignup: {
    stored: string[];
    features: string[];
    limitations: string[];
  };
  instagramSignup: {
    stored: string[];
    features: string[];
    advantages: string[];
  };
}

export default function ComparisonPage() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch actual data from MongoDB to show what's stored
    async function fetchComparison() {
      try {
        const res = await fetch("/api/demo/comparison");
        if (res.ok) {
          const comparisonData = await res.json();
          setData(comparisonData);
        }
      } catch (error) {
        console.error("Failed to fetch comparison data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, []);

  const comparisonData: ComparisonData = {
    normalSignup: {
      stored: [
        "Email address",
        "Password (hashed)",
        "Name",
        "Role (influencer/brand)",
        "Profile information (category, location, bio, pricing)",
        "Contact information (email, WhatsApp, website)"
      ],
      features: [
        "Manual profile setup",
        "Edit profile details",
        "Searchable by brands (after approval)",
        "Can connect Instagram later"
      ],
      limitations: [
        "No automatic Instagram data",
        "Must manually enter metrics",
        "No real-time analytics",
        "No Instagram media preview",
        "No audience demographics"
      ]
    },
    instagramSignup: {
      stored: [
        "All normal signup data PLUS:",
        "Instagram User ID",
        "Instagram Username",
        "Instagram Biography",
        "Profile Picture URL",
        "Follower Count",
        "Following Count",
        "Access Tokens (encrypted)",
        "Token Expiration Dates",
        "Instagram Media (posts, reels, stories)",
        "Media Engagement (likes, comments, shares, saves)",
        "Media URLs and Permalinks",
        "Instagram Insights (reach, impressions)",
        "Audience Demographics (age, gender, location)",
        "Historical Analytics Data"
      ],
      features: [
        "Automatic Instagram profile sync",
        "Real-time analytics dashboard",
        "Engagement rate calculations",
        "Top-performing content analysis",
        "Audience demographics visualization",
        "Growth charts and trends",
        "Media performance metrics",
        "Automatic data refresh",
        "Instagram verification badge",
        "Priority in search results",
        "Media gallery preview",
        "Export analytics reports (JSON/CSV)",
        "Sync status indicators",
        "Verified account indicator"
      ],
      advantages: [
        "Instant profile completion",
        "No manual data entry",
        "Always up-to-date metrics",
        "Rich analytics and insights",
        "Better discoverability for brands",
        "Professional analytics dashboard",
        "Higher search ranking",
        "Trust indicators for brands",
        "Export capabilities for reporting",
        "Visual verification badges"
      ]
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-block text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Signup Comparison: Normal vs Instagram
          </h1>
          <p className="text-slate-600">
            See what data is stored and what features are available for each signup method
          </p>
        </div>

        {/* Comparison Table */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Normal Signup */}
          <div className="border border-slate-200 rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Normal Signup
              </h2>
              <p className="text-sm text-slate-600">
                Email/Password registration
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <span className="mr-2">📦</span> Data Stored in MongoDB
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  {comparisonData.normalSignup.stored.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <span className="mr-2">✨</span> Available Features
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  {comparisonData.normalSignup.features.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-blue-600">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <span className="mr-2">⚠️</span> Limitations
                </h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  {comparisonData.normalSignup.limitations.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-orange-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Instagram Signup */}
          <div className="border border-purple-300 rounded-lg p-6 bg-purple-50">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-purple-900 mb-2">
                Instagram Signup
              </h2>
              <p className="text-sm text-purple-700">
                OAuth with Instagram Business/Creator account
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <span className="mr-2">📦</span> Data Stored in MongoDB
                </h3>
                <ul className="space-y-1 text-sm text-purple-800">
                  {comparisonData.instagramSignup.stored.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <span className="mr-2">✨</span> Available Features
                </h3>
                <ul className="space-y-1 text-sm text-purple-800">
                  {comparisonData.instagramSignup.features.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-blue-600">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <span className="mr-2">🚀</span> Advantages
                </h3>
                <ul className="space-y-1 text-sm text-purple-800">
                  {comparisonData.instagramSignup.advantages.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-green-600">★</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* MongoDB Collections Info */}
        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            MongoDB Collections Used
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Both Signup Methods:</h3>
              <ul className="space-y-1 text-slate-700">
                <li>• <code className="bg-slate-200 px-1 rounded">users</code> - User accounts</li>
                <li>• <code className="bg-slate-200 px-1 rounded">influencerprofiles</code> - Profile details</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Instagram Signup Only:</h3>
              <ul className="space-y-1 text-slate-700">
                <li>• <code className="bg-slate-200 px-1 rounded">instagramaccounts</code> - Instagram account data</li>
                <li>• <code className="bg-slate-200 px-1 rounded">instagrammedia</code> - Posts, reels, stories</li>
                <li>• <code className="bg-slate-200 px-1 rounded">instagraminsights</code> - Analytics & demographics</li>
                <li>• <code className="bg-slate-200 px-1 rounded">synclogs</code> - Sync history</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Mode Info */}
        <div className="mt-8 border border-yellow-300 rounded-lg p-6 bg-yellow-50">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            🎭 Demo Mode Available
          </h2>
          <p className="text-sm text-yellow-800 mb-4">
            You can test Instagram signup with mock data without connecting a real Instagram account.
            All mock data is stored in MongoDB just like real data, so you can see exactly what gets saved.
          </p>
          <Link
            href="/auth/login"
            className="inline-block text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
          >
            Try Demo Mode →
          </Link>
        </div>
      </div>
    </main>
  );
}


