"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const router = (0, express_1.Router)();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configure Multer to use memory storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }
        // Upload to Cloudinary using a stream
        const stream = cloudinary_1.v2.uploader.upload_stream({ folder: "fework_uploads" }, (error, result) => {
            if (error || !result) {
                console.error("Cloudinary upload error:", error);
                res.status(500).json({ success: false, message: "Upload to Cloudinary failed" });
                return;
            }
            // Return the secure URL to the frontend
            res.status(200).json({
                success: true,
                secure_url: result.secure_url,
                message: "Upload successful",
            });
        });
        // End the stream with the buffer
        stream.end(req.file.buffer);
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: error.message || "Upload failed" });
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map