import { Router } from "express";
import { getAllSkills, createSkill, updateSkill, deleteSkill } from "../controllers/skill.controller.js";

const router = Router();

router.get("/", getAllSkills);
router.post("/", createSkill);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);

export default router;