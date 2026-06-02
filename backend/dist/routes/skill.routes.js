"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const skill_controller_1 = require("../controllers/skill.controller");
const router = (0, express_1.Router)();
// Public: GET all skills (for signup form, search filters)
router.get("/", skill_controller_1.getSkills);
router.get("/categories", skill_controller_1.getCategories);
// Admin-only: mutating routes
router.use(auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("admin"));
router.post("/categories", skill_controller_1.createCategory);
router.patch("/categories/:id", skill_controller_1.updateCategory);
router.delete("/categories/:id", skill_controller_1.deleteCategory);
router.post("/", skill_controller_1.createSkill);
router.patch("/:id", skill_controller_1.updateSkill);
router.delete("/:id", skill_controller_1.deleteSkill);
exports.default = router;
//# sourceMappingURL=skill.routes.js.map