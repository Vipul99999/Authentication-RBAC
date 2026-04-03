import rateLimit from "express-rate-limit";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // stricter for login
  message: {
    success: false,
    message: "Too many attempts. Try again later.",
  },
});

export const registrationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for registration  
  message: {
    success: false,
    message: "Too many registration attempts. Try again later.",
  },
});
