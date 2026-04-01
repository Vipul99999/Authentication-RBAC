import { Router } from "express";
import * as ctrl from "./user.controller";
import { protect } from "../auth/auth.middleware";

const router = Router();

// 🔐 All routes require login
router.use(protect);

router.get("/me", ctrl.profile);
router.patch("/update", ctrl.update);
router.post("/change-password", ctrl.changePass);

// PIN
router.post("/set-pin", ctrl.setPinCtrl);
router.post("/change-pin", ctrl.changePinCtrl);


export default router;