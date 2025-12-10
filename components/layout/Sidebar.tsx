import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard/influencer", label: "Influencer Dashboard" },
  { href: "/dashboard/brand", label: "Brand Dashboard" }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/80 p-4 md:block">
      <div className="mb-6">
        <Link href="/" className="block text-lg font-semibold text-slate-100">
          InstaAnalytics
        </Link>
        <p className="mt-1 text-xs text-slate-500">
          Insights for brands & creators
        </p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <main className="flex-1 px-4 py-4 md:px-8 md:py-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}


