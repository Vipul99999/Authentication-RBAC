import { Request, Response } from "express";
import { generateRandomToken, hashToken } from "../../utils/token";
import { signAccessToken } from "../../utils/jwt";
import { prisma } from "../../config/db";
import { setRefreshCookie } from "../../utils/cookies";

/**
 * 🔐 Google callback handler
 */
export const googleCallback = async (req: any, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.redirect("/login?error=oauth_failed");
  }

  // 🔐 Tokens
  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
  });

  const rawRefresh = generateRandomToken();

  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken: hashToken(rawRefresh),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setRefreshCookie(res, rawRefresh);

  // redirect to frontend
  res.redirect(
    `${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`
  );
};