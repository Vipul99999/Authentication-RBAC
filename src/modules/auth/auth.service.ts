import { prisma } from "../../config/db";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { generateRandomToken, hashToken } from "../../utils/token";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 min
const REFRESH_EXPIRES_DAYS = 1; // 1 day

import { AppError } from "../../middleware/error.middleware";
import { Role } from "@prisma/client";

// 🔥 Find or create address (uses unique constraint)
export const findOrCreateAddress = async (addressData: {
  state: string;
  district: string;
  city: string;
  village: string;
  pincode: string;
}) => {
  try {
    return await prisma.address.create({
      data: addressData,
    });
  } catch (err: any) {
    // 🔥 If unique constraint fails → fetch existing
    return prisma.address.findFirst({
      where: addressData,
    });
  }
};

// 🔥 Check existing user
export const checkUserExists = async (email?: string, phone?: string) => {
  return prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : undefined,
        phone ? { phone } : undefined,
      ].filter(Boolean) as any,
    },
  });
};

// 🔥 Create HANDLER
export const createHandler = async (data: {
  name: string;
  email: string;
  phone: string;
  addressId: number;
  createdById: string;
}) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: Role.HANDLER, // ✅ FIXED
      addressId: data.addressId,
      createdById: data.createdById,
    },
  });
};

// 🔥 Create USER
export const createUser = async (data: {
  name: string;
  email?: string;
  phone: string;
  addressId: number;
  createdById: string;
}) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: Role.USER,
      addressId: data.addressId,
      createdById: data.createdById,
    },
  });
};



export const loginUser = async (
  email: string,
  password: string,
  ip?: string,
  userAgent?: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // 🔒 Generic error (avoid user enumeration)
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // 🔒 Account active check
  if (!user.isActive) {
    throw new AppError("Account disabled", 403);
  }

  // 🔒 Email verification check
  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email", 403);
  }

  // 🔒 Account lock check
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError("Account locked. Try again later.", 403);
  }

  // 🔐 Password check
  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    const attempts = user.failedAttempts + 1;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: attempts,
        lockUntil:
          attempts >= MAX_FAILED_ATTEMPTS
            ? new Date(Date.now() + LOCK_TIME_MS)
            : null,
      },
    });

    throw new AppError("Invalid credentials", 401);
  }

  // ✅ Reset failed attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lockUntil: null,
    },
  });

  // 🔐 Generate tokens
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
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
    refreshToken: rawRefreshToken,
  };
};


export const refreshSession = async (
  token: string,
  ip?: string,
  userAgent?: string
) => {
    // 🔒 Verify token
  let decoded: any;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid token", 401);
  }

  const hashed = hashToken(token);

  const session = await prisma.userSession.findFirst({
    where: {
      refreshToken: hashed,
      isActive: true,
    },
    include: { user: true },
  });

  // 🔒 Session not found → possible reuse attack
  // 🔥 REUSE DETECTED
if (!session) {
  // 🔥 revoke ALL sessions for this user
  await prisma.userSession.updateMany({
    where: { userId: decoded.userId },
    data: { isActive: false },
  });

  throw new AppError("Session compromised. Logged out from all devices.", 401);
}
  // 🔒 Expired
  if (session.expiresAt < new Date()) {
    throw new AppError("Session expired", 401);
  }

  

  // 🔒 User still active?
  if (!session.user.isActive) {
    throw new AppError("Account disabled", 403);
  }

  // 🔥 ROTATION: deactivate old session
  await prisma.userSession.update({
    where: { id: session.id },
    data: { isActive: false },
  });

  // 🔐 New tokens
  const newAccessToken = signAccessToken({
    userId: session.user.id,
    role: session.user.role,
  });

  const newRawRefresh = generateRandomToken();
  const newHashed = hashToken(newRawRefresh);

  // 💾 New session
  await prisma.userSession.create({
    data: {
      userId: session.user.id,
      refreshToken: newHashed,
      ipAddress: ip,
      userAgent,
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

  await prisma.userSession.updateMany({
    where: {
      refreshToken: hashed,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
};

export const logoutAllDevices = async (userId: string) => {
  await prisma.userSession.updateMany({
    where: { userId },
    data: { isActive: false },
  });
};