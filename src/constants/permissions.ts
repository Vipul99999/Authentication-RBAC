export const PERMISSIONS = {
  CREATE_USER: "create_user",
  CREATE_USER_LIMITED: "create_user_limited",
  VIEW_USERS: "view_users",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  REVOKE_SESSIONS: "revoke_sessions",
  MANAGE_ROLES: "manage_roles",
} as const;

export const ROLE_PERMISSIONS = {
  ADMIN: [
    "create_user",
    "view_users",
    "view_audit_logs",
    "revoke_sessions",
    "manage_roles",
  ],
  HANDLER: ["create_user_limited"],
  USER: [],
};