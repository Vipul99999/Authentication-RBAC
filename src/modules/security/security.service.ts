import { prisma } from "../../config/db";

export const detectSuspiciousActivity = async (userId: string) => {
  const lastAttempts = await prisma.auditLog.findMany({
    where: {
      userId,
      action: "LOGIN_FAILED",
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (lastAttempts.length >= 5) {
    return {
      suspicious: true,
      reason: "Multiple failed login attempts",
    };
  }

  return { suspicious: false };
};