import { Request, Response } from "express";
import {
  
  loginUser,
  refreshSession,
  logoutUser,
} from "./auth.service";
import {
  setRefreshCookie,
  clearRefreshCookie,
} from "../../utils/cookies";

import { AppError } from "../../middleware/error.middleware";
import {
  findOrCreateAddress,
  createHandler,
  createUser,
  checkUserExists,
  logoutAllDevices
} from "./auth.service";
import { Role } from "@prisma/client";

import {
  requestPasswordReset,
  resetPassword,
} from "./passwordReset.service";

// 🔥 Validators
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone: string) =>
  /^[6-9]\d{9}$/.test(phone);

const isValidPincode = (pincode: string) =>
  /^\d{6}$/.test(pincode);

const isStrongPassword = (password: string) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

export const register = async (req: any, res: Response) => {
  const creator = req.dbUser;

  const { name, email, phone, role } = req.body;

  // 🔒 Required
  if (!name || !phone || !role) {
    throw new AppError("Name, phone, role required", 400);
  }

  if (!isValidPhone(phone)) {
    throw new AppError("Invalid phone number", 400);
  }

  if (email && !isValidEmail(email)) {
    throw new AppError("Invalid email", 400);
  }

  // 🔒 Duplicate check
  const exists = await checkUserExists(email, phone);
  if (exists) {
    throw new AppError("User already exists", 409);
  }

  // 🔥 ADMIN → HANDLER
  if (creator.role === Role.ADMIN && role === "HANDLER") {
    const { state, district, city, village, pincode } = req.body;

    if (!state || !district || !city || !village || !pincode) {
      throw new AppError("Address required", 400);
    }

    if (!isValidPincode(pincode)) {
      throw new AppError("Invalid pincode", 400);
    }

    const address = await findOrCreateAddress({
      state,
      district,
      city,
      village,
      pincode,
    });

    const handler = await createHandler({
      name,
      email,
      phone,
      addressId: address.id,
      createdById: creator.id,
    });

    return res.status(201).json({
      success: true,
      data: handler,
    });
  }

  // 🔥 HANDLER → USER
  if (creator.role === Role.HANDLER && role === "USER") {
    const user = await createUser({
      name,
      email,
      phone,
      addressId: creator.addressId,
      createdById: creator.id,
    });

    return res.status(201).json({
      success: true,
      data: user,
    });
  }

  throw new AppError("Not allowed", 403);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 🔒 Required fields
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // 🔒 Format validation
  if (!isValidEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (password.length < 8) {
    throw new AppError("Invalid credentials", 400);
  }

  // 🔥 Call service
  const { user, accessToken, refreshToken } = await loginUser(
    email,
    password,
    req.ip,
    req.headers["user-agent"] as string
  );

  // 🍪 Set refresh token cookie (httpOnly)
  setRefreshCookie(res, refreshToken);

  return res.json({
    success: true,
    accessToken,
    user,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError("Refresh token missing", 401);
  }

  const { accessToken, refreshToken } = await refreshSession(
    token,
    req.ip,
    req.headers["user-agent"] as string
  );

  // 🍪 rotate cookie
  setRefreshCookie(res, refreshToken);

  return res.json({
    success: true,
    accessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await logoutUser(token);
  }

  clearRefreshCookie(res);

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const logoutAll = async (req: any, res: Response) => {
  const user = req.dbUser;

  await logoutAllDevices(user.id);

  clearRefreshCookie(res);

  return res.json({
    success: true,
    message: "Logged out from all devices",
  });
};


// 🔥 Request reset
export const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    throw new AppError("Valid email required", 400);
  }

  await requestPasswordReset(email);

  return res.json({
    success: true,
    message: "If account exists, reset link sent",
  });
};

// 🔥 Reset password
export const resetPasswordController = async (
  req: Request,
  res: Response
) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError("Token and password required", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const result = await resetPassword(token, password);

  return res.json(result);
};
