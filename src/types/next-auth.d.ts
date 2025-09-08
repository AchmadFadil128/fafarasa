import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: "ADMIN" | "USER";
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      role: "ADMIN" | "USER";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "USER";
    username: string;
  }
}
