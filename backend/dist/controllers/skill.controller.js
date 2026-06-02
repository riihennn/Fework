"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getSkills = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const Skill_model_1 = require("../models/Skill.model");
const response_utils_1 = require("../utils/response.utils");
// ─── Skill Categories ──────────────────────────────────────────────────────
/** GET /api/skills/categories */
const getCategories = async (_req, res, next) => {
    try {
        const categories = await Skill_model_1.SkillCategory.find().sort({ sortOrder: 1, name: 1 });
        (0, response_utils_1.sendSuccess)(res, "Categories fetched", categories);
    }
    catch (e) {
        next(e);
    }
};
exports.getCategories = getCategories;
/** POST /api/skills/categories */
const createCategory = async (req, res, next) => {
    try {
        const { name, slug, icon, description, sortOrder } = req.body;
        if (!name || !slug)
            return (0, response_utils_1.sendError)(res, "name and slug are required", 400);
        const cat = await Skill_model_1.SkillCategory.create({ name, slug, icon, description, sortOrder: sortOrder ?? 0 });
        (0, response_utils_1.sendSuccess)(res, "Category created", cat, 201);
    }
    catch (e) {
        if (e.code === 11000)
            return (0, response_utils_1.sendError)(res, "Category name or slug already exists", 409);
        next(e);
    }
};
exports.createCategory = createCategory;
/** PATCH /api/skills/categories/:id */
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cat = await Skill_model_1.SkillCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!cat)
            return (0, response_utils_1.sendError)(res, "Category not found", 404);
        (0, response_utils_1.sendSuccess)(res, "Category updated", cat);
    }
    catch (e) {
        if (e.code === 11000)
            return (0, response_utils_1.sendError)(res, "Category name or slug already exists", 409);
        next(e);
    }
};
exports.updateCategory = updateCategory;
/** DELETE /api/skills/categories/:id */
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cat = await Skill_model_1.SkillCategory.findById(id);
        if (!cat)
            return (0, response_utils_1.sendError)(res, "Category not found", 404);
        // Ungroup all skills that were in this category (set category to "")
        await Skill_model_1.Skill.updateMany({ category: cat.name }, { $set: { category: "" } });
        await cat.deleteOne();
        (0, response_utils_1.sendSuccess)(res, "Category deleted; skills moved to ungrouped");
    }
    catch (e) {
        next(e);
    }
};
exports.deleteCategory = deleteCategory;
// ─── Skills ───────────────────────────────────────────────────────────────
/**
 * GET /api/skills
 * Returns:
 *   - skills: all skills (flat array)
 *   - ungrouped: skills with no category
 *   - grouped: skills grouped by active categories
 */
const getSkills = async (_req, res, next) => {
    try {
        const [skills, categories] = await Promise.all([
            Skill_model_1.Skill.find().sort({ category: 1, sortOrder: 1, name: 1 }),
            Skill_model_1.SkillCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }),
        ]);
        const ungrouped = skills.filter((s) => !s.category || s.category.trim() === "");
        const grouped = categories.map((cat) => ({
            category: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            description: cat.description,
            catId: cat._id.toString(),
            skills: skills.filter((s) => s.category === cat.name),
        }));
        (0, response_utils_1.sendSuccess)(res, "Skills fetched", { skills, ungrouped, grouped });
    }
    catch (e) {
        next(e);
    }
};
exports.getSkills = getSkills;
/** POST /api/skills */
const createSkill = async (req, res, next) => {
    try {
        const { name, category, sortOrder } = req.body;
        if (!name)
            return (0, response_utils_1.sendError)(res, "name is required", 400);
        const skill = await Skill_model_1.Skill.create({ name, category: category || "", sortOrder: sortOrder ?? 0 });
        (0, response_utils_1.sendSuccess)(res, "Skill created", skill, 201);
    }
    catch (e) {
        if (e.code === 11000)
            return (0, response_utils_1.sendError)(res, "A skill with this name already exists", 409);
        next(e);
    }
};
exports.createSkill = createSkill;
/** PATCH /api/skills/:id */
const updateSkill = async (req, res, next) => {
    try {
        const { id } = req.params;
        const skill = await Skill_model_1.Skill.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!skill)
            return (0, response_utils_1.sendError)(res, "Skill not found", 404);
        (0, response_utils_1.sendSuccess)(res, "Skill updated", skill);
    }
    catch (e) {
        if (e.code === 11000)
            return (0, response_utils_1.sendError)(res, "A skill with this name already exists", 409);
        next(e);
    }
};
exports.updateSkill = updateSkill;
/** DELETE /api/skills/:id */
const deleteSkill = async (req, res, next) => {
    try {
        const { id } = req.params;
        const skill = await Skill_model_1.Skill.findByIdAndDelete(id);
        if (!skill)
            return (0, response_utils_1.sendError)(res, "Skill not found", 404);
        (0, response_utils_1.sendSuccess)(res, "Skill deleted");
    }
    catch (e) {
        next(e);
    }
};
exports.deleteSkill = deleteSkill;
//# sourceMappingURL=skill.controller.js.map