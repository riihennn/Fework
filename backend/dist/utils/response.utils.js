"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200) => {
    const response = { success: true, message, data };
    res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, error) => {
    const response = { success: false, message, error };
    res.status(statusCode).json(response);
};
exports.sendError = sendError;
//# sourceMappingURL=response.utils.js.map