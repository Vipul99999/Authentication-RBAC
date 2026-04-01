import { Request, Response, NextFunction } from "express";
import { evaluatePolicy } from "../modules/security/policy.engine";
import { AppError } from "./error.middleware";

export const authorize = (action: string, getResource?: Function) => {
  return async (req: any, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      let resource = null;

      if (getResource) {
        resource = await getResource(req);
      }

      const allowed = evaluatePolicy({
        user,
        resource,
        action,
        context: {
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      if (!allowed) {
        throw new AppError("Forbidden", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};