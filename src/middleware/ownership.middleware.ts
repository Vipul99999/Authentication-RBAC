import { AppError } from "./error.middleware";

export const requireOwnershipOrAdmin = (paramKey = "userId") => {
  return (req: any, _res: any, next: any) => {
    const targetId = req.params[paramKey];

    if (
      req.user.role !== "ADMIN" &&
      req.user.userId !== targetId
    ) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
};