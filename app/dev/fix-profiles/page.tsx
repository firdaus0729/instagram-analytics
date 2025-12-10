"use client";

import { useState } from "react";

export default function FixProfilesPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleFixProfiles = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      // First, get debug info
      const debugRes = await fetch("/api/influencers/search/debug");
      const debugData = await debugRes.json();
      setDebugInfo(debugData);

      // Then fix profiles via admin endpoint
      const res = await fetch("/api/admin/make-public", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Profiles fixed successfully!");
        // Refresh debug info
        const newDebugRes = await fetch("/api/influencers/search/debug");
        const newDebugData = await newDebugRes.json();
        setDebugInfo(newDebugData);
      } else {
        setError(data.error || "Failed to fix profiles");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDebug = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/influencers/search/debug");
      const data = await res.json();
      if (res.ok) {
        setDebugInfo(data);
      } else {
        setError("Failed to load debug info");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Fix Influencer Profiles
        </h1>
        <p className="mb-8 text-slate-600">
          This utility will make all influencer profiles public and approve all influencers. Use this to fix visibility issues.
        </p>

        <div className="mb-6 flex gap-4">
          <button
            onClick={handleLoadDebug}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Check Status"}
          </button>
          <button
            onClick={handleFixProfiles}
            disabled={loading}
            className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Fix All Profiles"}
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {debugInfo && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Debug Information</h2>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Total Influencers</div>
                <div className="text-2xl font-bold text-slate-900">{debugInfo.totalInfluencers}</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <div className="text-sm text-green-600">Visible</div>
                <div className="text-2xl font-bold text-green-700">{debugInfo.visibleCount}</div>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <div className="text-sm text-red-600">Not Visible</div>
                <div className="text-2xl font-bold text-red-700">{debugInfo.notVisibleCount}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Influencer Details:</h3>
              {debugInfo.influencers.map((inf: any, idx: number) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-4 ${
                    inf.status === "✅ Visible"
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{inf.name || inf.email}</div>
                      <div className="text-sm text-slate-600">{inf.email}</div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Status:</span> {inf.status}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>Profile: {inf.hasProfile ? "✅" : "❌"}</div>
                      <div>Public: {inf.isPublic ? "✅" : "❌"}</div>
                      <div>Approved: {inf.isApproved ? "✅" : "❌"}</div>
                      <div>Instagram: {inf.hasInstagram ? "✅" : "❌"}</div>
                      {inf.hasInstagram && (
                        <div className="text-xs text-slate-500">@{inf.instagramUsername}</div>
                      )}
                    </div>
                  </div>
                  {inf.issues.length > 0 && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium text-red-700">Issues:</div>
                      <ul className="ml-4 list-disc">
                        {inf.issues.map((issue: string, i: number) => (
                          <li key={i} className="text-red-600">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Why profiles aren't showing:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
            <li>Profile must have <code className="bg-slate-100 px-1 rounded">isPublic: true</code></li>
            <li>User must have <code className="bg-slate-100 px-1 rounded">isApproved: true</code></li>
            <li>Instagram account must be connected</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

