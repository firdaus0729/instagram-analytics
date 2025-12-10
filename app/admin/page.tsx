"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Influencer {
  id: string;
  email: string;
  name?: string;
  isApproved: boolean;
  createdAt: string;
  profile?: {
    category?: string;
    location?: string;
    isPublic: boolean;
  };
  instagram?: {
    username?: string;
    followersCount?: number;
  };
}

export default function AdminPanel() {
  const router = useRouter();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      const res = await fetch("/api/admin/influencers");
      if (res.ok) {
        const data = await res.json();
        setInfluencers(data.influencers || []);
      } else if (res.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Failed to fetch influencers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const res = await fetch("/api/admin/influencers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerId: id, isApproved: approved })
      });

      if (res.ok) {
        fetchInfluencers();
      }
    } catch (error) {
      console.error("Failed to update approval:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-purple-600">JustInfluence Admin</div>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/auth/login");
              }}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Influencer Approvals</h1>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Influencer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Instagram
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {influencers.map((influencer) => (
                <tr key={influencer.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {influencer.name || "N/A"}
                    </div>
                    <div className="text-sm text-slate-500">{influencer.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {influencer.instagram ? (
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          @{influencer.instagram.username}
                        </div>
                        <div className="text-sm text-slate-500">
                          {influencer.instagram.followersCount?.toLocaleString() || 0} followers
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Not connected</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {influencer.profile ? (
                      <div>
                        <div>{influencer.profile.category || "N/A"}</div>
                        <div>{influencer.profile.location || "N/A"}</div>
                      </div>
                    ) : (
                      "No profile"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        influencer.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {influencer.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    {!influencer.isApproved ? (
                      <button
                        onClick={() => handleApprove(influencer.id, true)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(influencer.id, false)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {influencers.length === 0 && (
          <div className="mt-8 text-center text-slate-600">No influencers found.</div>
        )}
      </div>
    </div>
  );
}

