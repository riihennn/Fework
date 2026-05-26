import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skill.controller";

const router = Router();

// Public: GET all skills (for signup form, search filters)
router.get("/", getSkills);
router.get("/categories", getCategories);

// Admin-only: mutating routes
router.use(requireAuth, requireRole("admin"));

router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.post("/", createSkill);
router.patch("/:id", updateSkill);
router.delete("/:id", deleteSkill);

export default router;
