import { prisma } from "../../config/db";
import { AppError } from "../../middleware/error.middleware";
import { hashPassword, comparePassword } from "../../utils/bcrypt";

/**
 * 👤 Get user profile
 */
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError("User not found", 404);

  return user;
};

/**
 * ✏️ Update profile
 */
export const updateProfile = async (
  userId: string,
  data: { email?: string; phone?: string }
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new AppError("User not found", 404);
  if (!user.isActive) throw new AppError("User is inactive", 403);

  // 🔐 Prevent duplicate email/phone
  if (data.email) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists && exists.id !== userId) {
      throw new AppError("Email already in use", 400);
    }
  }

  if (data.phone) {
    const exists = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (exists && exists.id !== userId) {
      throw new AppError("Phone already in use", 400);
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data,
  });
};

/**
 * 🔐 Change password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new AppError("User not found", 404);

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw new AppError("Incorrect current password", 400);

  const hashed = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashed },
  });

  return { success: true };
};

/**
 * 🔢 Set PIN (first time)
 */
export const setPin = async (userId: string, pin: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new AppError("User not found", 404);

  if (user.isPinEnabled) {
    throw new AppError("PIN already set. Use change PIN.", 400);
  }

  const hashed = await hashPassword(pin);

  await prisma.user.update({
    where: { id: userId },
    data: {
      pinHash: hashed,
      isPinEnabled: true,
    },
  });

  return { success: true };
};

/**
 * 🔄 Change PIN
 */
export const changePin = async (
  userId: string,
  currentPin: string,
  newPin: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.pinHash) {
    throw new AppError("PIN not set", 400);
  }

  const valid = await comparePassword(currentPin, user.pinHash);
  if (!valid) throw new AppError("Incorrect PIN", 400);

  const hashed = await hashPassword(newPin);

  await prisma.user.update({
    where: { id: userId },
    data: { pinHash: hashed },
  });

  return { success: true };
};

/**
 * 🔐 Deactivate account (soft delete)
 */
export const deactivateAccount = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  // 🔥 logout all sessions
  await prisma.userSession.deleteMany({
    where: { userId },
  });

  return { success: true };
};