import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no providers, no Prisma. This is what middleware uses to
// verify the session JWT. The Credentials provider (which needs Prisma +
// bcrypt, both Node-only) lives in auth.ts and is only pulled in by code
// that runs in the Node.js runtime (route handlers, server components,
// server actions) — never by middleware.
export const authConfig = {
  pages: { signIn: "/login" },
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
