import { Request, Response, NextFunction } from "express";
import { Skill, SkillCategory } from "../models/Skill.model";
import { sendSuccess, sendError } from "../utils/response.utils";

// ─── Skill Categories ──────────────────────────────────────────────────────

/** GET /api/skills/categories */
export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await SkillCategory.find().sort({ sortOrder: 1, name: 1 });
    sendSuccess(res, "Categories fetched", categories);
  } catch (e) { next(e); }
};

/** POST /api/skills/categories */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, icon, description, sortOrder } = req.body;
    if (!name || !slug) return sendError(res, "name and slug are required", 400);
    const cat = await SkillCategory.create({ name, slug, icon, description, sortOrder: sortOrder ?? 0 });
    sendSuccess(res, "Category created", cat, 201);
  } catch (e: any) {
    if (e.code === 11000) return sendError(res, "Category name or slug already exists", 409);
    next(e);
  }
};

/** PATCH /api/skills/categories/:id */
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cat = await SkillCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!cat) return sendError(res, "Category not found", 404);
    sendSuccess(res, "Category updated", cat);
  } catch (e: any) {
    if (e.code === 11000) return sendError(res, "Category name or slug already exists", 409);
    next(e);
  }
};

/** DELETE /api/skills/categories/:id */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cat = await SkillCategory.findById(id);
    if (!cat) return sendError(res, "Category not found", 404);
    // Ungroup all skills that were in this category (set category to "")
    await Skill.updateMany({ category: cat.name }, { $set: { category: "" } });
    await cat.deleteOne();
    sendSuccess(res, "Category deleted; skills moved to ungrouped");
  } catch (e) { next(e); }
};

// ─── Skills ───────────────────────────────────────────────────────────────

/**
 * GET /api/skills
 * Returns:
 *   - skills: all skills (flat array)
 *   - ungrouped: skills with no category
 *   - grouped: skills grouped by active categories
 */
export const getSkills = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [skills, categories] = await Promise.all([
      Skill.find().sort({ category: 1, sortOrder: 1, name: 1 }),
      SkillCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }),
    ]);

    const ungrouped = skills.filter((s) => !s.category || s.category.trim() === "");

    const grouped = categories.map((cat) => ({
      category: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      catId: (cat._id as any).toString(),
      skills: skills.filter((s) => s.category === cat.name),
    }));

    sendSuccess(res, "Skills fetched", { skills, ungrouped, grouped });
  } catch (e) { next(e); }
};

/** POST /api/skills */
export const createSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, sortOrder } = req.body;
    if (!name) return sendError(res, "name is required", 400);
    const skill = await Skill.create({ name, category: category || "", sortOrder: sortOrder ?? 0 });
    sendSuccess(res, "Skill created", skill, 201);
  } catch (e: any) {
    if (e.code === 11000) return sendError(res, "A skill with this name already exists", 409);
    next(e);
  }
};

/** PATCH /api/skills/:id */
export const updateSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!skill) return sendError(res, "Skill not found", 404);
    sendSuccess(res, "Skill updated", skill);
  } catch (e: any) {
    if (e.code === 11000) return sendError(res, "A skill with this name already exists", 409);
    next(e);
  }
};

/** DELETE /api/skills/:id */
export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) return sendError(res, "Skill not found", 404);
    sendSuccess(res, "Skill deleted");
  } catch (e) { next(e); }
};
