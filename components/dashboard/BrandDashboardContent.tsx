"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { InstagramBadge, VerifiedBadge } from "@/components/common/InstagramBadge";

interface Influencer {
  id: string;
  name: string;
  username: string;
  profilePictureUrl?: string;
  followersCount: number;
  engagementRate: number;
  category?: string;
  location?: string;
  bio?: string;
  hasInstagram?: boolean;
  isVerified?: boolean;
  accountType?: string;
  pricing?: {
    perPost?: number;
    perReel?: number;
    perStory?: number;
    package?: number;
  };
}

export function BrandDashboardContent() {
  const router = useRouter();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    location: "",
    minFollowers: "",
    maxFollowers: "",
    minEngagement: "",
    maxEngagement: ""
  });

  useEffect(() => {
    fetchInfluencers();
  }, [filters]);

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.location) params.append("location", filters.location);
      if (filters.minFollowers) params.append("minFollowers", filters.minFollowers);
      if (filters.maxFollowers) params.append("maxFollowers", filters.maxFollowers);
      if (filters.minEngagement) params.append("minEngagement", filters.minEngagement);
      if (filters.maxEngagement) params.append("maxEngagement", filters.maxEngagement);

      const res = await fetch(`/api/influencers/search?${params.toString()}`, {
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();
        setInfluencers(data.influencers || []);
        
        // Show debug info in development
        if (process.env.NODE_ENV === "development" && data.debug) {
          console.log("Search Debug Info:", data.debug);
        }
      } else {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch influencers:", error);
      }
    } catch (error) {
      console.error("Failed to fetch influencers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-purple-600">JustInfluence</div>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Discover Influencers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Search and filter influencers to find the perfect match for your campaigns.
        </p>

        {/* Filters */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Filters</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Name, username, bio..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              >
                <option value="">All Categories</option>
                <option value="Food & Lifestyle">Food & Lifestyle</option>
                <option value="Fashion">Fashion</option>
                <option value="Beauty">Beauty</option>
                <option value="Travel">Travel</option>
                <option value="Fitness">Fitness</option>
                <option value="Tech">Tech</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="City, Country"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Min Followers
              </label>
              <input
                type="number"
                value={filters.minFollowers}
                onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
                placeholder="0"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Max Followers
              </label>
              <input
                type="number"
                value={filters.maxFollowers}
                onChange={(e) => setFilters({ ...filters, maxFollowers: e.target.value })}
                placeholder="Any"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Min Engagement (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={filters.minEngagement}
                onChange={(e) => setFilters({ ...filters, minEngagement: e.target.value })}
                placeholder="0"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Max Engagement (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={filters.maxEngagement}
                onChange={(e) => setFilters({ ...filters, maxEngagement: e.target.value })}
                placeholder="Any"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    category: "",
                    location: "",
                    minFollowers: "",
                    maxFollowers: "",
                    minEngagement: "",
                    maxEngagement: ""
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Influencer List */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center text-slate-600">Loading influencers...</div>
          ) : influencers.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <p className="mb-4 text-slate-600">No influencers found matching your criteria.</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-500">
                  Make sure influencers are:
                </p>
                <ul className="text-sm text-slate-500">
                  <li>• Approved by admin</li>
                  <li>• Have public profiles</li>
                  <li>• Connected their Instagram account</li>
                </ul>
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-4">
                    <a
                      href="/api/influencers/search/debug"
                      target="_blank"
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      View Debug Info →
                    </a>
                    <span className="mx-2 text-slate-400">|</span>
                    <a
                      href="/dev/fix-profiles"
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Fix Profiles →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {influencers.map((influencer) => (
                <Link
                  key={influencer.id}
                  href={`/influencers/${influencer.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={influencer.profilePictureUrl || "/placeholder-avatar.png"}
                        alt={influencer.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      {influencer.hasInstagram && (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
                          <InstagramBadge verified={influencer.isVerified} className="text-[10px] px-1.5 py-0.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{influencer.name}</h3>
                        {influencer.isVerified && <VerifiedBadge className="text-[10px]" />}
                      </div>
                      <p className="text-sm text-purple-600">@{influencer.username}</p>
                      {influencer.bio && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {influencer.bio}
                        </p>
                      )}
                      <div className="mt-4 flex gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Followers:</span>{" "}
                          <span className="font-medium text-slate-900">
                            {influencer.followersCount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Engagement:</span>{" "}
                          <span className="font-medium text-green-600">
                            {influencer.engagementRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      {influencer.pricing && (
                        <div className="mt-2 text-sm text-slate-600">
                          From ${influencer.pricing.perPost || influencer.pricing.perReel || "N/A"}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
