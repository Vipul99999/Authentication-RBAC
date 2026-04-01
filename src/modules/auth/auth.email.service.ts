import { prisma } from "../../config/db";
import { generateRandomToken, hashToken } from "../../utils/token";
import { AppError } from "../../middleware/error.middleware";

const EXPIRY = 15 * 60 * 1000; // 15 min

export const sendVerificationEmail = async (email: string) => {
  const token = generateRandomToken();
  const hashed = hashToken(token);

  await prisma.emailVerificationToken.create({
    data: {
      email,
      tokenHash: hashed,
      expiresAt: new Date(Date.now() + EXPIRY),
    },
  });

  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  // TODO: send via email service
  console.log("Verification link:", link);
};

export const verifyEmail = async (token: string) => {
  const hashed = hashToken(token);

  const record = await prisma.emailVerificationToken.findFirst({
    where: { tokenHash: hashed },
  });

  if (!record) throw new AppError("Invalid token", 400);

  if (record.expiresAt < new Date()) {
    throw new AppError("Token expired", 400);
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { isEmailVerified: true },
  });

  await prisma.emailVerificationToken.delete({
    where: { id: record.id },
  });

  return { success: true };
};