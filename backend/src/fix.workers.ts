import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.model";

async function fixWorkerPasswords() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to DB");

  // Hash the password exactly ONCE
  const correctHashedPassword = await bcrypt.hash("Worker@123", 12);

  // Update all workers in the database without triggering the Mongoose pre-save hook
  const result = await User.updateMany(
    { role: "worker" },
    { $set: { password: correctHashedPassword } }
  );
  
  console.log(`✅ Fixed double-hashing! Updated ${result.modifiedCount} workers.`);
  await mongoose.disconnect();
}

fixWorkerPasswords().catch(console.error);
