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
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        required: false,
        defaultValue: "staff",
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
      return session;
    },
  },
});
