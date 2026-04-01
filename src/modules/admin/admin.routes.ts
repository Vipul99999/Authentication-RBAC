import { Router } from "express";
import * as ctrl from "./admin.controller";
import { protect, restrictTo } from "../auth/auth.middleware";
import {
  adminActionGuard,
  preventSelfAction,
} from "./admin.middleware";

const router = Router();

router.use(protect, restrictTo("ADMIN"));

// dashboard
router.get("/dashboard", ctrl.dashboard);

// user security
router.patch("/lock/:userId", preventSelfAction, ctrl.lockUser);
router.patch("/unlock/:userId", ctrl.unlockUser);

// sessions
router.get("/sessions/:userId", ctrl.sessions);
router.delete("/sessions/:sessionId", ctrl.revoke);
router.delete("/sessions/all/:userId", ctrl.revokeAll);

// suspicious
router.get("/security/suspicious", ctrl.suspicious);

export default router;