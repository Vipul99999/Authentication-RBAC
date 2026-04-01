import { prisma } from "../../config/db";

export const createAuditLog = async ({
  userId,
  action,
  metadata,
  ipAddress,
  userAgent,
}: {
  userId?: string;
  action: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // never break main flow
    console.error("Audit log failed:", err);
  }
};