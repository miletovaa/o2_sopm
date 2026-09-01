import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return null;

        // Account created without a password (see Users management) — whatever is submitted
        // here, for this first sign-in, becomes the account's permanent password.
        if (user.passwordHash === null) {
          if (password.length < 8) return null;

          const passwordHash = await hash(password, 12);
          await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
        } else {
          const isValidPassword = await compare(password, user.passwordHash);
          if (!isValidPassword) return null;
        }

        return {
          id: user.id,
          name: user.username,
          role: user.role,
          permissions: Array.isArray(user.permissions)
            ? (user.permissions as string[])
            : [],
        };
      },
    }),
  ],
});
