import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { auth, signOut } from "@/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UploadSopButton } from "@/components/UploadSopButton";
import { hasPermission } from "@/lib/roles";
import "./globals.css";

// Runs before hydration so the correct theme class is present for first
// paint (no flash of the wrong theme). Explicit choice (localStorage) wins;
// otherwise falls back to the OS preference.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOP Manager",
  description: "SOP storage, versioning, and access control",
};

async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-white px-10 py-3 dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        <Link
          href="/"
          className="mr-4 text-lg text-heading"
        >
          SOP<span className="text-heading/60">Manager</span>
        </Link>
          {user && (
            <Link
              href="/reference-materials"
              className="mr-4 mt-1 hover:text-heading hover:underline"
            >
              Reference files
            </Link>
          )}
          {user && (
            <Link
              href="/safety-materials"
              className="mr-4 mt-1 hover:text-heading hover:underline"
            >
              Safety materials
            </Link>
          )}
          <UploadSopButton isEmployee={hasPermission(user, "content.edit")} />
      </div>
      <div className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        {user && (
          <span className="mr-4">
            {user.name} (<i>{user.role.toLowerCase()}</i>)
          </span>
        )}
        {user && hasPermission(user, "users.view") && (
          <Link
            href="/users"
            title="Manage users"
            aria-label="Manage users"
            className="mr-1 rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
          </Link>
        )}
        <ThemeToggle />
        {user && (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="cursor-pointer rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
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
      className={`${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
