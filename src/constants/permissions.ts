// src/constants/permissions.ts

import { Role, Permission, PERMISSIONS } from "../types/global.types";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS), // full access

  HANDLER: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.VIEW_USER,
  ],

  USER: [
    PERMISSIONS.READ_PROFILE,
    PERMISSIONS.UPDATE_PROFILE,
  ],
};