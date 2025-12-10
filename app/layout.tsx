import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JustInfluence - Connecting creators with brands",
  description:
    "Discover high-performing influencers, analyze deep audience insights, and manage impactful campaigns—all on JustInfluence."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}


