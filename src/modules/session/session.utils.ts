import { hashToken } from "../../utils/token";

export const hashRefreshToken = (token: string) => {
  return hashToken(token);
};

export const isSessionExpired = (expiresAt: Date) => {
  return expiresAt.getTime() < Date.now();
};

export const buildSessionMeta = (req: any) => ({
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});