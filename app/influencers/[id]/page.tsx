import { notFound } from "next/navigation";
import Link from "next/link";
import { InstagramBadge, VerifiedBadge } from "@/components/common/InstagramBadge";

async function getInfluencerProfile(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/influencers/public/${id}`, {
      cache: "no-store"
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function PublicInfluencerProfilePage({
  params
}: {
  params: { id: string };
}) {
  const data = await getInfluencerProfile(params.id);
  if (!data) notFound();

  const { influencer, profile, instagram, samplePosts } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              JustInfluence
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-purple-600 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Profile Header */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-shrink-0">
              <img
                src={instagram.profilePictureUrl || "/placeholder-avatar.png"}
                alt={influencer.name || instagram.username}
                className="h-32 w-32 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">
                  {influencer.name || instagram.username}
                </h1>
                <InstagramBadge verified={true} />
                <VerifiedBadge />
              </div>
              <p className="mt-1 text-lg text-purple-600">@{instagram.username}</p>
              {profile.bio && <p className="mt-4 text-slate-600">{profile.bio}</p>}
              <div className="mt-6 flex flex-wrap gap-6">
                <div>
                  <div className="text-sm text-slate-500">Followers</div>
                  <div className="text-xl font-bold text-slate-900">
                    {instagram.followersCount?.toLocaleString() || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Engagement Rate</div>
                  <div className="text-xl font-bold text-green-600">
                    {instagram.engagementRate.toFixed(2)}%
                  </div>
                </div>
                {profile.category && (
                  <div>
                    <div className="text-sm text-slate-500">Category</div>
                    <div className="text-xl font-bold text-slate-900">{profile.category}</div>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <div className="text-sm text-slate-500">Location</div>
                    <div className="text-xl font-bold text-slate-900">{profile.location}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        {profile.pricing && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Pricing</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {profile.pricing.perPost && (
                <div>
                  <div className="text-sm text-slate-500">Per Post</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${profile.pricing.perPost}
                  </div>
                </div>
              )}
              {profile.pricing.perReel && (
                <div>
                  <div className="text-sm text-slate-500">Per Reel</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${profile.pricing.perReel}
                  </div>
                </div>
              )}
              {profile.pricing.perStory && (
                <div>
                  <div className="text-sm text-slate-500">Per Story</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${profile.pricing.perStory}
                  </div>
                </div>
              )}
              {profile.pricing.package && (
                <div>
                  <div className="text-sm text-slate-500">Package Deal</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${profile.pricing.package}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sample Posts */}
        {samplePosts && samplePosts.length > 0 && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Sample Posts</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {samplePosts.map((post: any) => (
                <div key={post.id} className="overflow-hidden rounded-lg">
                  <img
                    src={post.mediaUrl}
                    alt={post.caption || "Post"}
                    className="h-64 w-full object-cover"
                  />
                  {post.caption && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.caption}</p>
                  )}
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>❤️ {post.likeCount || 0}</span>
                    <span>💬 {post.commentsCount || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Contact</h2>
          <div className="flex flex-wrap gap-4">
            {profile.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700"
              >
                Send Email
              </a>
            )}
            {profile.contactWhatsApp && (
              <a
                href={`https://wa.me/${profile.contactWhatsApp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-green-600 bg-white px-6 py-3 font-medium text-green-600 hover:bg-green-50"
              >
                WhatsApp
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-purple-600 bg-white px-6 py-3 font-medium text-purple-600 hover:bg-purple-50"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

