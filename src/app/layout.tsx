import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { auth, signOut } from "@/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UploadSopButton } from "@/components/UploadSopButton";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/10">
      <Link
        href="/"
        className="text-xl font-semibold dark:text-zinc-50"
      >
        SOP<span className="text-gray-500">Manager</span>
      </Link>
      <div className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        <UploadSopButton isEmployee={user?.role === "EMPLOYEE"} />
        {user && (
          <span className="mr-4">
            {user.name} (<i>{user.role.toLowerCase()}</i>)
          </span>
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
