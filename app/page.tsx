import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold text-purple-600">JustInfluence</div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900">
              How It Works
            </Link>
            <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
            <Link href="#team" className="text-sm text-slate-600 hover:text-slate-900">
              Team
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="rounded-lg border border-purple-600 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
              <span className="text-purple-600">Connecting</span>{" "}
              <span className="text-slate-700">creators with brands that value real engagement.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Discover high-performing influencers, analyze deep audience insights, and manage
              impactful campaigns—all on JustInfluence.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard/brand"
                className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-8 py-3 text-base font-medium text-white hover:bg-purple-700"
              >
                For Brands <span className="ml-2">→</span>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-lg border-2 border-purple-600 px-8 py-3 text-base font-medium text-purple-600 hover:bg-purple-50"
              >
                For Influencers <span className="ml-2">→</span>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-400 border-2 border-white"></div>
                <div className="h-8 w-8 rounded-full bg-pink-400 border-2 border-white"></div>
                <div className="h-8 w-8 rounded-full bg-green-400 border-2 border-white"></div>
              </div>
              <p className="text-sm text-slate-600">
                Join over <span className="font-semibold">5,000+ influencers</span> and{" "}
                <span className="font-semibold">1,000+ brands</span>
              </p>
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-xl">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                {/* Dashboard Header */}
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Influencer Analytics Dashboard
                  </h3>
                  <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                    @travelwithalex
                  </div>
                </div>

                {/* Metrics Placeholders */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div className="h-16 rounded-lg bg-slate-100"></div>
                  <div className="h-16 rounded-lg bg-slate-100"></div>
                  <div className="h-16 rounded-lg bg-slate-100"></div>
                </div>

                {/* Monthly Engagement Chart */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">Monthly Engagement</h4>
                  <div className="flex items-end justify-between gap-2">
                    {[60, 75, 55, 85, 70, 90].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-purple-600"
                        style={{ height: `${height}%`, minHeight: "40px" }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Audience Age Chart */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">Audience Age</h4>
                  <div className="flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full border-8 border-purple-600 border-t-transparent"></div>
                  </div>
                </div>

                {/* Performance Trends */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">Performance Trends</h4>
                  <div className="h-16 w-full rounded bg-gradient-to-r from-purple-200 to-purple-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
