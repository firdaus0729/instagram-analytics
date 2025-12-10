"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  category?: string;
  location?: string;
  bio?: string;
  pricing?: {
    perPost?: number;
    perReel?: number;
    perStory?: number;
    package?: number;
  };
  contactEmail?: string;
  contactWhatsApp?: string;
  website?: string;
  isPublic?: boolean;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    isPublic: true
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/influencers/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/influencers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save profile");
        setSaving(false);
        return;
      }

      router.push("/dashboard/influencer");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setSaving(false);
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
            <div className="text-2xl font-bold text-purple-600">JustInfluence</div>
            <button
              onClick={() => router.push("/dashboard/influencer")}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Category/Niche</label>
                <select
                  value={profile.category || ""}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <option value="">Select category</option>
                  <option value="Food & Lifestyle">Food & Lifestyle</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Travel">Travel</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Tech">Tech</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Location</label>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="e.g., Mumbai, India"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Bio</label>
                <textarea
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell brands about yourself..."
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Pricing (Optional)</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Per Post ($)</label>
                <input
                  type="number"
                  value={profile.pricing?.perPost || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      pricing: { ...profile.pricing, perPost: parseFloat(e.target.value) || undefined }
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Per Reel ($)</label>
                <input
                  type="number"
                  value={profile.pricing?.perReel || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      pricing: { ...profile.pricing, perReel: parseFloat(e.target.value) || undefined }
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Per Story ($)</label>
                <input
                  type="number"
                  value={profile.pricing?.perStory || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      pricing: { ...profile.pricing, perStory: parseFloat(e.target.value) || undefined }
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Package Deal ($)</label>
                <input
                  type="number"
                  value={profile.pricing?.package || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      pricing: { ...profile.pricing, package: parseFloat(e.target.value) || undefined }
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={profile.contactEmail || ""}
                  onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">WhatsApp</label>
                <input
                  type="text"
                  value={profile.contactWhatsApp || ""}
                  onChange={(e) => setProfile({ ...profile, contactWhatsApp: e.target.value })}
                  placeholder="+1234567890"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Website</label>
                <input
                  type="url"
                  value={profile.website || ""}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={profile.isPublic}
                onChange={(e) => setProfile({ ...profile, isPublic: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-slate-700">
                Make my profile visible to brands
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/influencer")}
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

