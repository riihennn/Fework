import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.model";

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to DB");

  const email = "admin@fework.com";
  const existingAdmin = await User.findOne({ email });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    await User.create({
      name: "Admin User",
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      phone: "+910000000000",
      avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    });
    console.log(`✅ Admin created: ${email} / Admin@123`);
  } else {
    console.log(`✅ Admin already exists: ${email}`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch(console.error);
