"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOTPEmail = async ({ to, otp }) => {
    console.log('SMTP config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
    });
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        logger: true,
        debug: true,
    });
    const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@fework.com",
        to,
        subject: "Fework - Your Verification Code",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0F172A;">Welcome to Fework!</h2>
        <p>Please use the following 6-digit code to verify your email address. This code is valid for 30 seconds.</p>
        <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #0D9488; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="color: #64748B; font-size: 12px;">© ${new Date().getFullYear()} Fework. All rights reserved.</p>
      </div>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully via Nodemailer!");
    }
    catch (error) {
        console.error("=====================================");
        console.error("Error sending OTP email:", error);
        console.error("Fallback: Logging OTP to console.");
        console.error(`OTP for ${to} is: ${otp}`);
        console.error("=====================================");
        // Do not throw error so local development works without SMTP
    }
};
exports.sendOTPEmail = sendOTPEmail;
//# sourceMappingURL=email.utils.js.map