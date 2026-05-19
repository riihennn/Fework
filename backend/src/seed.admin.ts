import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db";
import User from "./models/User.model";

const seedAdmin = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: "admin@fework.com" });
    if (existing) {
      console.log("⚠️  Admin user already exists:", existing.email);
      process.exit(0);
    }

    await User.create({
      name: "Fework Admin",
      email: "admin@fework.com",
      password: "admin123!",
      role: "admin",
      isVerified: true,
    });

    console.log("✅ Admin user created:");
    console.log("   Email:    admin@fework.com");
    console.log("   Password: admin123!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err);
    process.exit(1);
  }
};

seedAdmin();
