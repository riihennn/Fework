"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", auth_controller_1.register);
router.post("/verify-signup-otp", auth_controller_1.verifyOTP);
router.post("/send-signup-otp", auth_controller_1.sendSignupOTP);
router.post("/login", auth_controller_1.login);
router.post("/google", auth_controller_1.googleLogin);
router.post("/logout", auth_controller_1.logout);
// Protected routes
router.get("/me", auth_middleware_1.requireAuth, auth_controller_1.getMe);
router.patch("/profile", auth_middleware_1.requireAuth, auth_controller_1.updateProfile);
router.patch("/change-password", auth_middleware_1.requireAuth, auth_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map