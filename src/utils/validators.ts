import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export const otpSchema = z.object({
  phone: z.string().min(10),
});

export const verifyOtpSchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
});