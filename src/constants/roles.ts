export const ROLES = {
  ADMIN: "ADMIN",
  HANDLER: "HANDLER",
  USER: "USER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];