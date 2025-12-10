"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          // If approved, redirect to dashboard
          if (data.user.isApproved) {
            router.push("/dashboard/influencer");
          }
        }
      } catch (error) {
        console.error("Failed to check status:", error);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-600">JustInfluence</h1>
          <p className="mt-2 text-slate-600">Account Pending Approval</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-6xl">⏳</div>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Your account is pending approval
          </h2>
          <p className="mb-6 text-slate-600">
            Thank you for signing up! Your influencer account is currently being reviewed by our
            admin team. You'll receive access to your dashboard once your account is approved.
          </p>

          <div className="mb-6 rounded-lg bg-purple-50 p-4 text-left">
            <h3 className="mb-2 font-semibold text-purple-900">What happens next?</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li>• Our team will review your profile</li>
              <li>• You'll receive an email notification when approved</li>
              <li>• Once approved, you can connect your Instagram account</li>
              <li>• Your profile will become visible to brands</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700"
            >
              Back to Login
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Check Status
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

