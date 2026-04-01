import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/error.middleware";

/**
 * 🛡️ Prevent admin abuse (rate sensitive actions)
 */
export const adminActionGuard = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Example: block dangerous actions in production without flag
  if (process.env.NODE_ENV === "production") {
    // you can add extra checks here
  }

  next();
};

/**
 * 🔐 Prevent self-destructive actions
 */
export const preventSelfAction = (req: any, _res: Response, next: NextFunction) => {
  const targetUserId = req.params.userId;

  if (req.user?.userId === targetUserId) {
    throw new AppError("You cannot perform this action on yourself", 400);
  }

  next();
};