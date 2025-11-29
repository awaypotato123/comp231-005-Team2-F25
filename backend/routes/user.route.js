import { Router } from "express";
import { 
  getCurrentUser, 
  updateProfile, 
  updatePassword,
  getUserStats,
    getPublicUser,
    updateUserCreds
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.get("/stats", protect, getUserStats);
router.get("/public/:id", getPublicUser);
router.put("/update-credits", protect, updateUserCreds);

export default router;