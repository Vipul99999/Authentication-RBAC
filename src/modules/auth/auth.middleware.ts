import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/jwt";
import { ROLE_PERMISSIONS } from "../../constants/permissions";

export const requirePermission = (permission: string) => {
  return (req: any, res: any, next: any) => {
    const role = req.user.role;

    const allowed = ROLE_PERMISSIONS[role]?.includes(permission);           
    if (!allowed) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
export const protect = (req: any, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) throw new Error();

    const token = auth.split(" ")[1];
    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};