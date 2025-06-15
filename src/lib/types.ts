import type { Session, User } from "better-auth";

// Розширений тип користувача
export type ExtendedUser = User & {
  role?: "admin" | "staff" | null;
};
export type ExtendedSession = Session & {
  user: ExtendedUser;
};
