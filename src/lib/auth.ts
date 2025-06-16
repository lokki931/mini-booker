import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "@/schema";
import { ExtendedSession, ExtendedUser } from "./types";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        required: false,
        defaultValue: "staff",
      },
      activeBusinessId: {
        type: "string",
        input: true,
        required: false,
        defaultValue: "",
      },
    },
  },
  callbacks: {
    async session({
      session,
      user,
    }: {
      session: ExtendedSession;
      user: ExtendedUser;
    }) {
      session.user.role = user.role;
      session.user.activeBusinessId = user.activeBusinessId;
      return session;
    },
  },
});
