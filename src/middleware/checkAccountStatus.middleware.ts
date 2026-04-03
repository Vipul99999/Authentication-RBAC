// src/middleware/checkAccountStatus.middleware.ts

import { prisma } from "../config/db";
import { AppError } from "./error.middleware";

export const checkAccountStatus = async (
  req: any,
  _res: any,
  next: any
) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) throw new AppError("User not found", 404);

  if (!user.isActive) {
    throw new AppError("Account disabled", 403);
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError("Account locked", 403);
  }

  // 🔥 CACHE USER HERE
  req.dbUser = user;

  next();
};