import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { canManageContent } from "@/lib/roles";

const { auth } = NextAuth(authConfig);

// Routes only Admins/Employees may reach: version history, edit/upload, and
// uploading reference & safety materials. Students can still read the
// reference/safety material lists and download files — just not add to
// them.
const STAFF_ONLY_PATTERNS = [
  /^\/sops\/new(\/|$)/,
  /^\/sops\/[^/]+\/edit(\/|$)/,
  /^\/sops\/[^/]+\/history(\/|$)/,
  /^\/reference-materials\/new(\/|$)/,
  /^\/safety-materials\/new(\/|$)/,
];

// The Users page itself: Admins can create Admins/Employees/Students,
// Employees can only create Students. Students can't reach it at all.
const USERS_PATTERNS = [/^\/users(\/|$)/];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiresStaff = STAFF_ONLY_PATTERNS.some((pattern) =>
    pattern.test(nextUrl.pathname),
  );
  if (requiresStaff && !canManageContent(role)) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  const requiresUsersAccess = USERS_PATTERNS.some((pattern) =>
    pattern.test(nextUrl.pathname),
  );
  if (requiresUsersAccess && !canManageContent(role)) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except the login page, the Auth.js API routes, and
  // Next.js internals/static assets.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
