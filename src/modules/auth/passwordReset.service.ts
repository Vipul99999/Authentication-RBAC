import { prisma } from "../../config/db";
import { generateRandomToken, hashToken } from "../../utils/token";
import { hashToken as hashPassword } from "../../utils/token";
import { AppError } from "../../middleware/error.middleware";
import { ResetType } from "@prisma/client";

const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// 🔥 Request password reset
export const requestPasswordReset = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // 🔒 Prevent user enumeration
  if (!user) return { success: true };

  // 🔥 Delete old unused tokens (same type)
  await prisma.passwordReset.deleteMany({
    where: {
      userId: user.id,
      type: ResetType.password,
      used: false,
    },
  });

  // 🔐 Generate token
  const rawToken = generateRandomToken();
  const hashedToken = hashToken(rawToken);

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: hashedToken,
      type: ResetType.password,
      expiresAt: new Date(Date.now() + EXPIRY_MS),
      used: false,
    },
  });

  const link = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  // 📩 Replace with real email service
  console.log("📩 Reset link:", link);

  return { success: true };
};

// 🔥 Reset password
export const resetPassword = async (
  token: string,
  newPassword: string
) => {
  const hashed = hashToken(token);

  const record = await prisma.passwordReset.findFirst({
    where: {
      token: hashed,
      type: ResetType.password,
      used: false,
    },
    include: { user: true },
  });

  if (!record) {
    throw new AppError("Invalid or already used token", 400);
  }

  // 🔒 Expiry check
  if (record.expiresAt < new Date()) {
    await prisma.passwordReset.delete({
      where: { id: record.id },
    });

    throw new AppError("Token expired", 400);
  }

  const newHash = await hashPassword(newPassword);

  // 🔥 TRANSACTION (CRITICAL)
  await prisma.$transaction([
    // 1️⃣ Update password + reset security state
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash: newHash,
        failedAttempts: 0,
        lockUntil: null,
      },
    }),

    // 2️⃣ Invalidate ALL sessions (IMPORTANT)
    prisma.userSession.updateMany({
      where: { userId: record.userId },
      data: { isActive: false },
    }),

    // 3️⃣ Mark token used
    prisma.passwordReset.update({
      where: { id: record.id },
      data: { used: true },
    }),
  ]);

  return {
    success: true,
    message: "Password reset successful",
  };
};