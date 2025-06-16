import type { Session, User } from "better-auth";

// Розширений тип користувача
export type ExtendedUser = User & {
  role?: "admin" | "staff" | null;
  activeBusinessId?: string;
};
export type ExtendedSession = Session & {
  user: ExtendedUser;
};
