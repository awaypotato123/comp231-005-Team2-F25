import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  suspendUser,
  addCreditsToUser,
  resetUserPassword,
  getAllSkillsAdmin,
  deleteSkillAdmin,
  getAdminStats
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = Router();



router.get("/stats", protect, isAdmin, getAdminStats);


router.get("/users", protect, isAdmin, getAllUsers);
router.get("/users/:id", protect, isAdmin, getUserById);
router.put("/users/:id/role", protect, isAdmin, updateUserRole);
router.put("/users/:id/suspend", protect, isAdmin, suspendUser);
router.put("/users/:id/credits", protect, isAdmin, addCreditsToUser);
router.put("/users/:id/reset-password", protect, isAdmin, resetUserPassword);
router.delete("/users/:id", protect, isAdmin, deleteUser);


router.get("/skills", protect, isAdmin, getAllSkillsAdmin);
router.delete("/skills/:id", protect, isAdmin, deleteSkillAdmin);

export default router;