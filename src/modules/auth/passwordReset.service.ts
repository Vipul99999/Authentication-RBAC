export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return; // avoid user enumeration

  const token = generateRandomToken();
  const hashed = hashToken(token);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashed,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  console.log("Reset link:", `${process.env.FRONTEND_URL}/reset?token=${token}`);
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashed = hashToken(token);

  const record = await prisma.passwordResetToken.findFirst({
    where: { token: hashed, used: false },
  });

  if (!record) throw new AppError("Invalid token", 400);

  if (record.expiresAt < new Date()) {
    throw new AppError("Expired token", 400);
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash: newHash },
  });

  // 🔥 invalidate sessions
  await prisma.userSession.deleteMany({
    where: { userId: record.userId },
  });

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { success: true };
};