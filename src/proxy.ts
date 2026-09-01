import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { hasPermission, type Permission } from "@/lib/roles";

const { auth } = NextAuth(authConfig);

// Viewing SOPs/materials (including version history and older-version downloads) is open to
// any logged-in user — only these write-ish pages are gated, and each needs at least one of
// the listed permissions to be reached at all. The pages themselves do finer-grained
// per-section gating (e.g. /sops/[id]/edit shows the metadata form only with content.edit and
// the new-version uploader only with content.new_version).
const CONTENT_GATED_PATTERNS: { pattern: RegExp; permissions: Permission[] }[] = [
  { pattern: /^\/sops\/new(\/|$)/, permissions: ["content.edit"] },
  { pattern: /^\/sops\/[^/]+\/edit(\/|$)/, permissions: ["content.edit", "content.new_version"] },
  { pattern: /^\/reference-materials\/new(\/|$)/, permissions: ["content.edit"] },
  { pattern: /^\/safety-materials\/new(\/|$)/, permissions: ["content.edit"] },
];

const USERS_PATTERNS = [/^\/users(\/|$)/];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const user = req.auth?.user;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const contentRule = CONTENT_GATED_PATTERNS.find(({ pattern }) =>
    pattern.test(nextUrl.pathname),
  );
  if (
    contentRule &&
    !contentRule.permissions.some((p) => hasPermission(user, p))
  ) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  const requiresUsersAccess = USERS_PATTERNS.some((pattern) =>
    pattern.test(nextUrl.pathname),
  );
  if (requiresUsersAccess && !hasPermission(user, "users.view")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except the login page, the Auth.js API routes, and
  // Next.js internals/static assets.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
