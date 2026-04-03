// types/policy.types.ts

export type Action =
  | "create_user"
  | "view_user"
  | "update_user"
  | "delete_user"
  | "read_profile"
  | "update_profile";

export type Role = "ADMIN" | "HANDLER" | "USER";

export interface PolicyContext {
  user: {
    id: string;
    role: Role;
    isActive: boolean;
  };
  resource?: {
    ownerId?: string;
  };
  action: Action;
  context?: {
    ip?: string;
    userAgent?: string;
    ipBlocked?: boolean;
  };
}