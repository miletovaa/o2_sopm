import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Routes only Employees may reach: version history, edit/upload, and
// management of reference & safety materials. Students are read-only on the
// current SOP version and never see any of this.
const EMPLOYEE_ONLY_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/sops\/new(\/|$)/,
  /^\/sops\/[^/]+\/edit(\/|$)/,
  /^\/sops\/[^/]+\/history(\/|$)/,
  /^\/reference-materials(\/|$)/,
  /^\/safety-materials(\/|$)/,
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const isEmployee = req.auth?.user?.role === "EMPLOYEE";

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiresEmployee = EMPLOYEE_ONLY_PATTERNS.some((pattern) =>
    pattern.test(nextUrl.pathname),
  );
  if (requiresEmployee && !isEmployee) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except the login page, the Auth.js API routes, and
  // Next.js internals/static assets.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
