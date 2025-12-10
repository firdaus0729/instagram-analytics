interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function AuthErrorPage({ searchParams }: Props) {
  const errorParam = searchParams?.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  
  const isBusinessAccountError = error?.includes("business_or_creator_required") || 
                                  error?.includes("instagram_business");
  
  const isInvalidScopeError = error?.includes("Invalid permissions") || 
                              error?.includes("invalid_scope") ||
                              error?.includes("Invalid Scopes") ||
                              error?.toLowerCase().includes("pages_show_list");

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-semibold text-red-600">
          Authentication Error
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          We couldn&apos;t complete your Instagram authentication.
        </p>
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm">
            <p className="font-semibold text-red-800">Error:</p>
            <p className="mt-1 font-mono break-words text-red-700">{error}</p>
          </div>
        )}

        {isInvalidScopeError && (
          <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <h2 className="font-semibold text-yellow-900 mb-2">
              ⚠️ Invalid Permissions Error
            </h2>
            <p className="text-sm text-yellow-800 mb-3">
              Facebook is rejecting the requested permissions. This means your Facebook app needs to be configured correctly in the Facebook Developer Console.
            </p>
            
            <div className="mb-3 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-xs font-semibold text-yellow-900 mb-1">Why is this happening?</p>
              <p className="text-xs text-yellow-800">
                The permission <code className="bg-yellow-200 px-1 rounded">pages_show_list</code> needs to be requested in your Facebook App&apos;s App Review section, even for development/testing.
              </p>
            </div>

            <div className="text-sm text-yellow-700">
              <p className="font-semibold mb-2">Quick Fix Checklist:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developer Console</a></li>
                <li>Select your app (App ID: check your .env.local file)</li>
                <li>Verify App Type is &quot;Business&quot; (Settings → Basic)</li>
                <li>Add &quot;Instagram Graph API&quot; product (NOT Basic Display)</li>
                <li>Go to App Review → Permissions and Features</li>
                <li>Request <code className="bg-yellow-200 px-1 rounded">pages_show_list</code> permission</li>
                <li>Add yourself as a Test User (Roles → Roles)</li>
              </ol>
            </div>
            <div className="mt-3 space-y-2">
              <a
                href="/docs/troubleshooting-invalid-scopes.md"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-yellow-700 hover:text-yellow-900 underline font-semibold"
              >
                📖 Complete Troubleshooting Guide →
              </a>
              <a
                href="/docs/instagram-oauth-setup.md"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                🔧 Instagram OAuth Setup Instructions →
              </a>
            </div>
          </div>
        )}

        {isBusinessAccountError && (
          <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h2 className="font-semibold text-blue-900 mb-2">
              ⚠️ Business or Creator Account Required
            </h2>
            <p className="text-sm text-blue-800 mb-3">
              Your Instagram account must be a <strong>Business</strong> or <strong>Creator</strong> account to use JustInfluence.
            </p>
            
            <div className="mb-3 p-3 bg-blue-100 rounded border border-blue-300">
              <p className="text-xs font-semibold text-blue-900 mb-1">Why is this required?</p>
              <p className="text-xs text-blue-800">
                Instagram&apos;s Graph API (which provides analytics, insights, and audience data) only works with Business or Creator accounts. 
                Personal accounts cannot access these features. This is Instagram&apos;s policy, not ours.
              </p>
            </div>

            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open Instagram app on your phone</li>
                <li>Go to Settings → Account</li>
                <li>Tap &quot;Switch to Professional Account&quot;</li>
                <li>Choose &quot;Business&quot; or &quot;Creator&quot; (Creator is easier - no Facebook Page needed)</li>
                <li>Complete the setup</li>
                <li>Come back and try again!</li>
              </ol>
            </div>
            <div className="mt-3 space-y-2">
              <a
                href="/docs/create-creator-account.md"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-800 underline font-semibold"
              >
                🎯 Create Creator Account (Easiest - No Facebook Page Needed) →
              </a>
              <a
                href="/docs/convert-instagram-to-business.md"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-800 underline"
              >
                📖 Convert to Business Account →
              </a>
              <a
                href="/docs/why-business-account-required.md"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-800 underline"
              >
                ❓ Learn why this is required →
              </a>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-center">
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Try again
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}


