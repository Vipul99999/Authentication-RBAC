// src/types/global.types.ts

export const ROLES = {
  ADMIN: "ADMIN",
  HANDLER: "HANDLER",
  USER: "USER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  CREATE_USER: "create_user",
  VIEW_USER: "view_user",
  UPDATE_USER: "update_user",
  READ_PROFILE: "read_profile",
  UPDATE_PROFILE: "update_profile",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}