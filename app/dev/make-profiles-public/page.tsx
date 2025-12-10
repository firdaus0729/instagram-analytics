"use client";

import { useState } from "react";

export default function MakeProfilesPublicPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMakePublic = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/make-public", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Profiles made public successfully!");
      } else {
        setError(data.error || "Failed to make profiles public");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Make All Profiles Public
        </h1>
        <p className="mb-8 text-slate-600">
          This utility will make all influencer profiles public. Useful for testing when you don't
          have admin access.
        </p>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <button
            onClick={handleMakePublic}
            disabled={loading}
            className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Make All Profiles Public"}
          </button>

          {message && (
            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
              {error}
            </div>
          )}
        </div>

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

