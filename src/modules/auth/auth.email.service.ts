import { prisma } from "../../config/db";
import { generateRandomToken, hashToken } from "../../utils/token";
import { AppError } from "../../middleware/error.middleware";

const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// 🔥 Send verification email
export const sendVerificationEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 🔒 Check user exists
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email already verified", 400);
  }

  // 🔥 Remove old tokens (important)
  await prisma.emailVerificationToken.deleteMany({
    where: { email: normalizedEmail },
  });

  // 🔐 Generate new token
  const rawToken = generateRandomToken();
  const hashedToken = hashToken(rawToken);

  await prisma.emailVerificationToken.create({
    data: {
      email: normalizedEmail,
      tokenHash: hashedToken,
      expiresAt: new Date(Date.now() + EXPIRY_MS),
    },
  });

  // 🔗 Create verification link
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

  // 📩 Send email (replace later with real provider)
  console.log("📩 Verification link:", link);

  return { success: true };
};

// 🔥 Verify email
export const verifyEmail = async (token: string) => {
  const hashed = hashToken(token);

  const record = await prisma.emailVerificationToken.findFirst({
    where: { tokenHash: hashed },
  });

  if (!record) {
    throw new AppError("Invalid or already used token", 400);
  }

  if (record.expiresAt < new Date()) {
    // 🔥 Cleanup expired token
    await prisma.emailVerificationToken.delete({
      where: { id: record.id },
    });

    throw new AppError("Token expired", 400);
  }

  // 🔒 Find user
  const user = await prisma.user.findUnique({
    where: { email: record.email },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    // 🔥 Cleanup token if already verified
    await prisma.emailVerificationToken.delete({
      where: { id: record.id },
    });

    return { success: true, message: "Already verified" };
  }

  // 🔥 Transaction (VERY IMPORTANT)
  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { isEmailVerified: true },
    }),

    prisma.emailVerificationToken.delete({
      where: { id: record.id },
    }),
  ]);

  return { success: true, message: "Email verified successfully" };
};