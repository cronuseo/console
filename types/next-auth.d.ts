import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
        organization_id: string;
    } & DefaultSession["user"];
  }
}
