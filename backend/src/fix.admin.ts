import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.model";

async function fixAdmin() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to DB");

  // Delete the messed up admin account
  await User.deleteOne({ email: "admin@fework.com" });

  // Create it properly (letting Mongoose pre-save hook hash it)
  await User.create({
    name: "Admin User",
    email: "admin@fework.com",
    password: "Admin@123", // DO NOT pre-hash it
    role: "admin",
    isVerified: true,
    phone: "+910000000000",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
  });
  
  console.log(`✅ Admin recreated correctly: admin@fework.com / Admin@123`);
  await mongoose.disconnect();
}

fixAdmin().catch(console.error);
