"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// DELETE /api/messages/all - Clear all chats for the current user
router.delete("/all", auth_middleware_1.requireAuth, message_controller_1.clearAllChats);
// GET /api/messages/:jobId - Get message history for a job
router.get("/:jobId", auth_middleware_1.requireAuth, message_controller_1.getMessages);
// DELETE /api/messages/:jobId - Clear message history for a job
router.delete("/:jobId", auth_middleware_1.requireAuth, message_controller_1.clearChat);
exports.default = router;
//# sourceMappingURL=message.routes.js.map