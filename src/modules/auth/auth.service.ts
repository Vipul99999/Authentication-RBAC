import { prisma } from "../../config/db";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { generateRandomToken, hashToken } from "../../utils/token";

const REFRESH_EXPIRES_DAYS = 1

export const registerUser = async (email: string, password: string) => {
  const exists = await prisma.user.findUnique({ where: { email } });

  if (exists) throw new AppError("User already exists", 400);

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashed,
      isEmailVerified: false,
    },
  });

  // 📩 Send verification
  await sendVerificationEmail(email);

  return user;
};

export const loginUser = async (
  email: string,
  password: string,
  ip?: string,
  userAgent?: string
) => {
  const user = await prisma.user.findFirst({ where: { email } });

  if (!user) throw new Error("Invalid credentials");

  // 🔒 Account lock check
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("Account locked. Try later.");
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: { increment: 1 },
        lockUntil:
          user.failedAttempts + 1 >= 5
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null,
      },
    });

    throw new Error("Invalid credentials");
  }

  // ✅ Reset attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lockUntil: null,
    },
  });

  // 🔐 Tokens
  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
  });

  const rawRefreshToken = generateRandomToken();
  const hashedRefreshToken = hashToken(rawRefreshToken);

  // 💾 Store session
  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken: hashedRefreshToken,
      ipAddress: ip,
      userAgent,
      expiresAt: new Date(
        Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    user,
    accessToken,
    refreshToken: rawRefreshToken,
  };
};

export const refreshSession = async (token: string) => {
  const hashed = hashToken(token);

  const session = await prisma.userSession.findFirst({
    where: {
      refreshToken: hashed,
      isActive: true,
    },
  });

  if (!session) throw new Error("Invalid session");

  if (session.expiresAt < new Date()) {
    throw new Error("Session expired");
  }

  const decoded: any = verifyRefreshToken(token);

  // 🔥 ROTATION (delete old)
  await prisma.userSession.delete({
    where: { id: session.id },
  });

  const newAccessToken = signAccessToken({
    userId: decoded.userId,
  });

  const newRawRefresh = generateRandomToken();
  const newHashed = hashToken(newRawRefresh);

  await prisma.userSession.create({
    data: {
      userId: decoded.userId,
      refreshToken: newHashed,
      expiresAt: new Date(
        Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRawRefresh,
  };
};

export const logoutUser = async (token: string) => {
  const hashed = hashToken(token);

  await prisma.userSession.deleteMany({
    where: { refreshToken: hashed },
  });
};

export const logoutAllDevices = async (userId: string) => {
  await prisma.userSession.deleteMany({
    where: { userId },
  });
};