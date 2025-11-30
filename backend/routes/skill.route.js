import { Router } from "express";
import { getSkillById, getAllSkills, createSkill, deleteSkill,  requestSkill,
  getSkillRequests } from "../controllers/skill.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/", getAllSkills);
router.get("/:id", getSkillById);


router.post("/", protect, createSkill);
router.delete("/:id", protect, deleteSkill);

router.post("/request/:skillId", protect, requestSkill);
router.get("/requests/skills/", protect, getSkillRequests);

export default router;