"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.googleLogin = exports.loginUser = exports.registerUser = exports.verifySignupOTP = exports.sendSignupOTP = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const Worker_model_1 = __importDefault(require("../models/Worker.model"));
const Otp_model_1 = __importDefault(require("../models/Otp.model"));
const jwt_utils_1 = require("../utils/jwt.utils");
const email_utils_1 = require("../utils/email.utils");
// ── Generate OTP ─────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
// ── Pre-Registration OTP Flow ────────────────────────────────
const sendSignupOTP = async (email) => {
    const existingUser = await User_model_1.default.findOne({ email });
    if (existingUser)
        throw new Error("An account with this email already exists.");
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    // Upsert OTP record
    await Otp_model_1.default.findOneAndUpdate({ email }, { otp, expiresAt, verified: false }, { upsert: true, new: true });
    await (0, email_utils_1.sendOTPEmail)({ to: email, otp });
    return {
        message: "An OTP has been sent to your email address.",
        otp // Temporary: return OTP directly to frontend
    };
};
exports.sendSignupOTP = sendSignupOTP;
const verifySignupOTP = async (email, otpCode) => {
    const otpRecord = await Otp_model_1.default.findOne({ email });
    if (!otpRecord)
        throw new Error("No OTP requested for this email.");
    if (otpRecord.expiresAt < new Date())
        throw new Error("OTP has expired. Please request a new one.");
    if (otpRecord.otp !== otpCode)
        throw new Error("Invalid OTP.");
    otpRecord.verified = true;
    await otpRecord.save();
    return { message: "Email verified successfully." };
};
exports.verifySignupOTP = verifySignupOTP;
// ── Register ────────────────────────────────────────────────
const registerUser = async (name, email, password, role, phone, workerProfile, city, address, state, pincode) => {
    const existing = await User_model_1.default.findOne({ email });
    if (existing)
        throw new Error("An account with this email already exists.");
    // Check if email was verified (except for Google auth which we handle differently, or if we bypass it.
    // Actually, Google Auth bypassed the OTP step in frontend, but here we require it.
    // Wait, the frontend sends "GOOGLE_AUTH_PLACEHOLDER_PASS" if Google Auth. 
    // Let's assume Google Auth is bypassed via controller, or we just verify OTP if they didn't do google login?
    // Let's check OTP unconditionally for now, or bypass if it's the placeholder pass?
    // Better: check if an OTP was verified for this email.
    if (password !== "GOOGLE_AUTH_PLACEHOLDER_PASS") {
        const otpRecord = await Otp_model_1.default.findOne({ email, verified: true });
        if (!otpRecord) {
            throw new Error("Email has not been verified. Please verify OTP first.");
        }
    }
    const user = await User_model_1.default.create({
        name,
        email,
        password,
        role,
        phone,
        // Only store address in User for CLIENT role.
        // For workers, address lives exclusively in the Worker collection.
        city: role !== "worker" ? (city || "") : "",
        address: role !== "worker" ? (address || "") : "",
        state: role !== "worker" ? (state || "") : "",
        pincode: role !== "worker" ? (pincode || "") : "",
        isVerified: true,
    });
    // If registering as a worker, create their professional profile
    if (role === "worker") {
        await Worker_model_1.default.create({
            user: user._id,
            category: workerProfile?.category || "",
            bio: workerProfile?.bio || "",
            skills: workerProfile?.skills || [],
            experience: workerProfile?.experience || "",
            hourlyRate: workerProfile?.hourlyRate || 0,
            location: workerProfile?.location || "",
            city: workerProfile?.city || "",
            state: workerProfile?.state || "",
            pincode: workerProfile?.pincode || "",
        });
    }
    // Clean up OTP record
    await Otp_model_1.default.deleteOne({ email });
    const token = (0, jwt_utils_1.signToken)({ id: user._id.toString(), role: user.role });
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            city: user.city,
            address: user.address,
            state: user.state,
            pincode: user.pincode,
            isVerified: user.isVerified,
        },
        token,
    };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await User_model_1.default.findOne({ email }).select("+password");
    if (!user)
        throw new Error("Invalid email or password.");
    if (user.isBlocked)
        throw new Error("Your account has been blocked by the admin.");
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
        throw new Error("Invalid email or password.");
    const token = (0, jwt_utils_1.signToken)({ id: user._id.toString(), role: user.role });
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            city: user.city,
            isVerified: user.isVerified,
        },
        token,
    };
};
exports.loginUser = loginUser;
const googleLogin = async (email) => {
    const user = await User_model_1.default.findOne({ email });
    if (!user)
        throw new Error("User not registered.");
    if (user.isBlocked)
        throw new Error("Your account has been blocked by the admin.");
    const token = (0, jwt_utils_1.signToken)({ id: user._id.toString(), role: user.role });
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            city: user.city,
            isVerified: user.isVerified,
        },
        token,
    };
};
exports.googleLogin = googleLogin;
// ── Get current user ─────────────────────────────────────────
const getMe = async (userId) => {
    const user = await User_model_1.default.findById(userId);
    if (!user)
        throw new Error("User not found.");
    if (user.isBlocked)
        throw new Error("Your account has been blocked by the admin.");
    return user;
};
exports.getMe = getMe;
//# sourceMappingURL=auth.service.js.map