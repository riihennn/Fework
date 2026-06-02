"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("client"), review_controller_1.submitReview);
router.get("/mine", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), review_controller_1.getMyReviews);
router.get("/worker/:workerId", review_controller_1.getWorkerReviews);
router.get("/check/:jobId", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("client"), review_controller_1.checkReviewed);
exports.default = router;
//# sourceMappingURL=review.routes.js.map