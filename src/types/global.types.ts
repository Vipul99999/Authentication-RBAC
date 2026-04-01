export type Role = "ADMIN" | "HANDLER" | "USER";

export interface JwtPayload {
  userId: string;
  role?: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}