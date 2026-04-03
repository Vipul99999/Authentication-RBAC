// src/modules/auth/auth.routes.ts

import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "./auth.controller";
import { authorize } from "../../middleware/authorize.middleware";
import passport from "../../config/passport";
import { googleCallback } from "./auth.oauth.controller";
import { PERMISSIONS } from "../../types/global.types";
// ✅ IMPORT MIDDLEWARES
import { protect } from "./auth.middleware";
import { checkAccountStatus } from "../../middleware/checkAccountStatus.middleware";
import { asyncHandler } from "../../utils/helper";
import { 
  authRateLimiter,
  registrationRateLimiter
 } from "../../middleware/rateLimit.middleware";
const router = Router();


// 🔐 GOOGLE OAUTH START (PUBLIC)
router.get(
  "/google",
  authRateLimiter,

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);


// 🔐 GOOGLE CALLBACK (PUBLIC)
router.get(
  "/google/callback",
  authRateLimiter,
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?error=oauth_failed",
  }),
  googleCallback
);


// 🧾 REGISTER (ADMIN --> HANDER, HANDLER-->USER) (PUBLIC)
router.post(
  "/register",
  registrationRateLimiter,
  protect,                 // 🔐 validate access token
  checkAccountStatus,      // 🔒 user active?
  authorize(PERMISSIONS.CREATE_USER), 
  asyncHandler(register)
);

// 🔑 LOGIN (PUBLIC)
router.post("/login", authRateLimiter, asyncHandler(login));


// 🔄 REFRESH TOKEN (PUBLIC or semi-protected)
router.post("/refresh", authRateLimiter, asyncHandler(refresh));


// 🚪 LOGOUT (PROTECTED 🔥)
router.post(
  "/logout",
  authRateLimiter,
  protect,                // 🔐 identify user
  checkAccountStatus,     // 🔒 check active/locked
  asyncHandler(logout)
);

export default router;