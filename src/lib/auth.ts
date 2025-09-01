import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Check database for admin credentials
        const admin = await prisma.adminUser.findUnique({
          where: { username: credentials.username as string }
        })

        if (admin && await bcrypt.compare(credentials.password as string, admin.password)) {
          return {
            id: admin.id.toString(),
            name: "Admin",
            email: "admin@example.com",
            role: "admin"
          }
        }

        return null
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user?.email || (profile as any)?.email
        if (!email) return "/login?error=AccessDenied"
        const allowed = await prisma.allowedEmail.findUnique({ where: { email } })
        if (!allowed) {
          return "/login?error=AccessDenied"
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        // Ensure role is always present (default to 'user' for OAuth users)
        token.role = (user as any).role ?? token.role ?? "user"
      }
      if (!token.role) {
        token.role = "user"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Map stable id from token.sub (OAuth) or keep existing
        ;(session.user as any).id = (token.sub as string) || (session.user as any).id || ""
        session.user.role = (token.role as string) || "user"
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  }
})
