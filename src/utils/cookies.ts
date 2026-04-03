import { Response } from "express";

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // ✅ safer for frontend
    path: "/api/auth/refresh",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie("refreshToken", {
    path: "/api/auth/refresh",
  });
};