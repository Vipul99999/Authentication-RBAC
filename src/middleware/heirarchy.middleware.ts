import { AppError } from "./error.middleware";

export const enforceHierarchy = (req: any, _res: any, next: any) => {
  const creator = req.user;
  const target = req.body;

  if (creator.role === "HANDLER") {
    if (creator.districtId !== target.districtId) {
      throw new AppError("Handler cannot create outside district", 403);
    }
  }

  next();
};