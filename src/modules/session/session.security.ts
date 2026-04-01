import { AppError } from "../../middleware/error.middleware";

export const validateSessionContext = (session: any, req: any) => {
  if (session.ipAddress && session.ipAddress !== req.ip) {
    throw new AppError("IP mismatch detected", 401);
  }

  if (
    session.userAgent &&
    session.userAgent !== req.headers["user-agent"]
  ) {
    throw new AppError("Device mismatch detected", 401);
  }
};