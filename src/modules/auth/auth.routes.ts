import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "./auth.controller";

import passport from "../../config/passport";
import { googleCallback } from "./auth.oauth.controller";

const router = Router();
// 🔐 Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// 🔐 Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?error=oauth_failed",
  }),
  googleCallback
);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;