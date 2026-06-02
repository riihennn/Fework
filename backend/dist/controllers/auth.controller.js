"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getMe = exports.googleLogin = exports.login = exports.sendSignupOTP = exports.verifyOTP = exports.register = void 0;
const zod_1 = require("zod");
const authService = __importStar(require("../services/auth.service"));
const response_utils_1 = require("../utils/response.utils");
const User_model_1 = __importDefault(require("../models/User.model"));
// ── Validation Schemas ───────────────────────────────────────
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.enum(["client", "worker"]).default("client"),
    phone: zod_1.z.string().optional(),
    // Worker-specific optional fields
    category: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    experience: zod_1.z.string().optional(),
    hourlyRate: zod_1.z.number().optional(),
    location: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
const verifyOTPSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
});
const sendSignupOTPSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
const googleLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
// ── Cookie Options ───────────────────────────────────────────
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
// ── POST /api/auth/register ──────────────────────────────────
const register = async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, response_utils_1.sendError)(res, parsed.error.errors[0].message, 400);
            return;
        }
        const { name, email, password, role, phone, category, bio, experience, hourlyRate, location, city, state, pincode, address, skills } = parsed.data;
        const result = await authService.registerUser(name, email, password, role, phone, { category, bio, experience, hourlyRate, location, city, state, pincode, skills }, city, address, state, pincode);
        // We set the cookie and log the user in immediately since they passed OTP validation before calling register.
        res.cookie("token", result.token, cookieOptions);
        res.cookie("user_role", result.user.role, { ...cookieOptions, httpOnly: false });
        (0, response_utils_1.sendSuccess)(res, "Registration successful.", result, 201);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed.";
        (0, response_utils_1.sendError)(res, message, 400);
    }
};
exports.register = register;
// ── POST /api/auth/verify-otp ────────────────────────────────
const verifyOTP = async (req, res) => {
    try {
        const parsed = verifyOTPSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, response_utils_1.sendError)(res, parsed.error.errors[0].message, 400);
            return;
        }
        const { email, otp } = parsed.data;
        const result = await authService.verifySignupOTP(email, otp);
        (0, response_utils_1.sendSuccess)(res, "Verification successful.", result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Verification failed.";
        (0, response_utils_1.sendError)(res, message, 400);
    }
};
exports.verifyOTP = verifyOTP;
// ── POST /api/auth/send-signup-otp ───────────────────────────
const sendSignupOTP = async (req, res) => {
    try {
        const parsed = sendSignupOTPSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, response_utils_1.sendError)(res, parsed.error.errors[0].message, 400);
            return;
        }
        const { email } = parsed.data;
        const result = await authService.sendSignupOTP(email);
        (0, response_utils_1.sendSuccess)(res, result.message, result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Resend OTP failed.";
        (0, response_utils_1.sendError)(res, message, 400);
    }
};
exports.sendSignupOTP = sendSignupOTP;
// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, response_utils_1.sendError)(res, parsed.error.errors[0].message, 400);
            return;
        }
        const { email, password } = parsed.data;
        const result = await authService.loginUser(email, password);
        res.cookie("token", result.token, cookieOptions);
        res.cookie("user_role", result.user.role, { ...cookieOptions, httpOnly: false });
        (0, response_utils_1.sendSuccess)(res, "Login successful.", result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Login failed.";
        (0, response_utils_1.sendError)(res, message, 401);
    }
};
exports.login = login;
// ── POST /api/auth/google ────────────────────────────────────
const googleLogin = async (req, res) => {
    try {
        const parsed = googleLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, response_utils_1.sendError)(res, parsed.error.errors[0].message, 400);
            return;
        }
        const { email } = parsed.data;
        const result = await authService.googleLogin(email);
        res.cookie("token", result.token, cookieOptions);
        res.cookie("user_role", result.user.role, { ...cookieOptions, httpOnly: false });
        (0, response_utils_1.sendSuccess)(res, "Google login successful.", result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Google login failed.";
        // Send 404 so the frontend knows the user is not registered
        (0, response_utils_1.sendError)(res, message, 404);
    }
};
exports.googleLogin = googleLogin;
// ── GET /api/auth/me ─────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await authService.getMe(req.user.id);
        (0, response_utils_1.sendSuccess)(res, "User fetched successfully.", user);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch user.";
        (0, response_utils_1.sendError)(res, message, 404);
    }
};
exports.getMe = getMe;
// ── PATCH /api/auth/profile ──────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { avatar, name, phone, city, address, state, pincode } = req.body;
        const user = await User_model_1.default.findById(req.user.id);
        if (!user) {
            (0, response_utils_1.sendError)(res, "User not found.", 404);
            return;
        }
        if (avatar !== undefined)
            user.avatar = avatar;
        if (name !== undefined)
            user.name = name;
        if (phone !== undefined)
            user.phone = phone;
        if (city !== undefined)
            user.city = city;
        if (address !== undefined)
            user.address = address;
        if (state !== undefined)
            user.state = state;
        if (pincode !== undefined)
            user.pincode = pincode;
        await user.save();
        (0, response_utils_1.sendSuccess)(res, "Profile updated.", {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            city: user.city,
            address: user.address,
            state: user.state,
            pincode: user.pincode,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update profile.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.updateProfile = updateProfile;
// ── PATCH /api/auth/change-password ──────────────────────────
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_model_1.default.findById(req.user.id).select("+password");
        if (!user) {
            (0, response_utils_1.sendError)(res, "User not found.", 404);
            return;
        }
        // Only check current password if it's not a google auth account (though they usually don't have passwords)
        if (user.password !== "GOOGLE_AUTH_PLACEHOLDER_PASS") {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                (0, response_utils_1.sendError)(res, "Incorrect current password.", 400);
                return;
            }
        }
        user.password = newPassword;
        await user.save();
        (0, response_utils_1.sendSuccess)(res, "Password updated successfully.");
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to change password.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.changePassword = changePassword;
// ── POST /api/auth/logout ────────────────────────────────────
const logout = (_req, res) => {
    res.clearCookie("token");
    res.clearCookie("user_role");
    (0, response_utils_1.sendSuccess)(res, "Logged out successfully.");
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map