import { Router } from "express";
import { getSkillById, getAllSkills, createSkill } from "../controllers/skill.controller";

const router = express.Router();

router.get("/", getAllSkills);
router.get("/:id", getSkillById);
router.post("/", createSkill);

export default router;