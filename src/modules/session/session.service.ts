import { prisma } from "../../config/db";
import { hashRefreshToken, isSessionExpired } from "./session.utils";
import { AppError } from "../../middleware/error.middleware";

/**
 * 🔐 Create session (login)
 */
export const createSession = async ({
  userId,
  refreshToken,
  ipAddress,
  userAgent,
  expiresAt,
}: {
  userId: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}) => {
  return prisma.userSession.create({
    data: {
      userId,
      refreshToken: hashRefreshToken(refreshToken),
      ipAddress,
      userAgent,
      expiresAt,
    },
  });
};

/**
 * 🔍 Find valid session
 */
export const findSession = async (token: string) => {
  const hashed = hashRefreshToken(token);

  const session = await prisma.userSession.findFirst({
    where: {
      refreshToken: hashed,
      isActive: true,
    },
  });

  if (!session) {
    throw new AppError("Invalid session", 401);
  }

  if (isSessionExpired(session.expiresAt)) {
    // auto cleanup
    await prisma.userSession.delete({ where: { id: session.id } });
    throw new AppError("Session expired", 401);
  }

  return session;
};

/**
 * 🔄 Rotate session (ANTI REPLAY ATTACK)
 */
export const rotateSession = async ({
  oldToken,
  newToken,
  userId,
  expiresAt,
}: {
  oldToken: string;
  newToken: string;
  userId: string;
  expiresAt: Date;
}) => {
  const oldHashed = hashRefreshToken(oldToken);

  const existing = await prisma.userSession.findFirst({
    where: { refreshToken: oldHashed },
  });

  if (!existing) {
    await prisma.auditLog.create({
    data: {
      userId,
      action: "TOKEN_REUSE_ATTACK",
    },
  });
    // 🔥 possible token reuse attack
    await revokeAllSessions(userId);
    throw new AppError("Session reuse detected", 401);
  }

  // delete old session
  await prisma.userSession.delete({
    where: { id: existing.id },
  });

  // create new
  return prisma.userSession.create({
    data: {
      userId,
      refreshToken: hashRefreshToken(newToken),
      expiresAt,
    },
  });
};

/**
 * 🚪 Logout single session
 */
export const revokeSession = async (token: string) => {
  const hashed = hashRefreshToken(token);

  await prisma.userSession.deleteMany({
    where: { refreshToken: hashed },
  });
};

/**
 * 🔥 Logout all devices
 */
export const revokeAllSessions = async (userId: string) => {
  await prisma.userSession.deleteMany({
    where: { userId },
  });
};

/**
 * 🧹 Cleanup expired sessions (cron job ready)
 */
export const cleanupSessions = async () => {
  await prisma.userSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};