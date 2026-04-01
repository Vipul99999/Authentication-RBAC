import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from "./auth.service";
import {
  setRefreshCookie,
  clearRefreshCookie,
} from "../../utils/cookies";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await registerUser(email, password);

  res.status(201).json({ user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser(
    email,
    password,
    req.ip,
    req.headers["user-agent"]
  );

  setRefreshCookie(res, refreshToken);

  res.json({ user, accessToken });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  const { accessToken, refreshToken } = await refreshSession(token);

  setRefreshCookie(res, refreshToken);

  res.json({ accessToken });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await logoutUser(token);
  }

  clearRefreshCookie(res);

  res.json({ message: "Logged out" });
};
