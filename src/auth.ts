import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = typeof credentials?.username === "string" ? credentials.username : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!username || !password) return null;

        const user = await prisma.userLogin.findUnique({
          where: { username },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const result = {
          id: String(user.id),
          username: user.username,
          role: user.role,
        } as unknown as User;
        return result;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as User;
        const t = token as JWT;
        (t as unknown as { role: "ADMIN" | "USER"; username: string }).role = (u as unknown as { role: "ADMIN" | "USER" }).role;
        (t as unknown as { role: "ADMIN" | "USER"; username: string }).username = (u as unknown as { username: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as unknown as { sub?: string; role?: "ADMIN" | "USER"; username?: string };
      if (session.user) {
        session.user.id = (t.sub ?? "");
        session.user.username = (t.username ?? "");
        session.user.role = (t.role ?? "USER");
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        const dest = new URL(url, baseUrl);
        if (dest.pathname === "/login" || dest.origin === baseUrl) return dest.toString();
      } catch {}
      return baseUrl + "/dashboard";
    },
  },
  pages: { signIn: "/login" },
});

export const { GET, POST } = handlers;

