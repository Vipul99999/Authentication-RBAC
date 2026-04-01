import { Router } from "express";
import {
  getFullHierarchy,
  getUsersByLocation,
} from "./location.service";
import { protect, restrictTo } from "../auth/auth.middleware";

const router = Router();

// 🌍 Get full location tree
router.get("/hierarchy", protect, getFullHierarchy);

// 📊 Admin analytics
router.get(
  "/users",
  protect,
  restrictTo("ADMIN"),
  async (req: any, res) => {
    const users = await getUsersByLocation(req.query);
    res.json({ users });
  }
);

export default router;