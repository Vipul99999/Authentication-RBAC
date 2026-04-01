import { prisma } from "../../config/db";
import { AppError } from "../../middleware/error.middleware";

/**
 * 📊 Dashboard stats
 */
export const getDashboardStats = async () => {
  const [users, handlers, sessions, failedLogins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "HANDLER" } }),
    prisma.userSession.count({ where: { isActive: true } }),
    prisma.auditLog.count({ where: { action: "LOGIN_FAILED" } }),
  ]);

  return { users, handlers, sessions, failedLogins };
};

/**
 * 🔐 Lock / Unlock user
 */
export const toggleUserLock = async (userId: string, lock: boolean) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lockUntil: lock ? new Date(Date.now() + 30 * 60 * 1000) : null,
      failedAttempts: 0,
    },
  });
};

/**
 * 📱 Get user sessions (devices)
 */
export const getUserSessions = async (userId: string) => {
  return prisma.userSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * 🚪 Revoke session
 */
export const revokeSession = async (sessionId: string) => {
  const session = await prisma.userSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) throw new AppError("Session not found", 404);

  return prisma.userSession.delete({
    where: { id: sessionId },
  });
};

/**
 * 🔥 Revoke all sessions
 */
export const revokeAllSessions = async (userId: string) => {
  return prisma.userSession.deleteMany({
    where: { userId },
  });
};

/**
 * 🚨 Suspicious users detection
 */
export const getSuspiciousUsers = async () => {
  return prisma.auditLog.groupBy({
    by: ["userId"],
    where: { action: "LOGIN_FAILED" },
    _count: true,
    having: {
      _count: {
        gt: 5,
      },
    },
  });
};