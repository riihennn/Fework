import { Router, Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    // Upload to Cloudinary using a stream
    const stream = cloudinary.uploader.upload_stream(
      { folder: "fework_uploads" },
      (error, result) => {
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
      }
    );

    // End the stream with the buffer
    stream.end(req.file.buffer);

  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
});

export default router;
