import { prisma } from "../../config/db";

export const getUserResource = async (req: any) => {
  const userId = req.params.userId;

  return prisma.user.findUnique({
    where: { id: userId },
  });
};