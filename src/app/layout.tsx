import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOP Management System",
  description: "SOP storage, versioning, and access control",
};

async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/10">
      <Link
        href="/"
        className="text-sm font-semibold text-black dark:text-zinc-50"
      >
        SOP Management System
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300">
          {user.role === "EMPLOYEE" && (
            <Link
              href="/sops/new"
              className="font-medium text-black hover:underline dark:text-zinc-50"
            >
              Upload new SOP
            </Link>
          )}
          <span>
            {user.name} ({user.role})
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded border border-black/10 px-3 py-1 text-xs font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
