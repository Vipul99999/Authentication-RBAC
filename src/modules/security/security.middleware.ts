import { Request, Response, NextFunction } from "express";
import { createAuditLog } from "../audit/audit.service";

export const trackRequest = async (
  req: any,
  _res: Response,
  next: NextFunction
) => {
  req.context = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };

  next();
};

export const logSuccess = (action: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await createAuditLog({
          userId: req.user?.userId,
          action,
          ipAddress: req.context?.ip,
          userAgent: req.context?.userAgent,
        });
      }
    });

    next();
  };
};

export const logFailure = (action: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      if (res.statusCode >= 400) {
        await createAuditLog({
          userId: req.user?.userId,
          action: `${action}_FAILED`,
          metadata: { statusCode: res.statusCode },
          ipAddress: req.context?.ip,
          userAgent: req.context?.userAgent,
        });
      }
    });

    next();
  };
};