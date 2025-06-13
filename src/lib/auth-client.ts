"use client";
import { createAuthClient } from "better-auth/client";
import { passkeyClient } from "better-auth/client/plugins";

export const client = createAuthClient({
  plugins: [passkeyClient()],
});
