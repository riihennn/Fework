import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.model";
import Worker from "./models/Worker.model";
import connectDB from "./config/db";

const names = [
  "Rahul Nair", "Sneha Menon", "Arjun Das", "Anjali Pillai", "Vishnu Prasad",
  "Meera Krishnan", "Siddharth Varma", "Kavya Suresh", "Aditya Rajan", "Priya Lakshmi"
];

const categories = ["plumber", "electrician", "ac", "cleaner", "painter", "carpenter", "mechanic", "mason"];

const seedWorkers = async () => {
  try {
    await connectDB();

    // 1. Clear existing workers and their users
    // We'll find users with @fework.com emails which we used for seeding
    const existingSeedUsers = await User.find({ email: { $regex: /@fework\.com$/ } });
    const userIds = existingSeedUsers.map(u => u._id);
    
    await Worker.deleteMany({ user: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });

    console.log("🗑️ Cleared old seed data");

    // 2. Seed new workers
    const cities = ["Kozhikode", "Kochi"];
    let nameIndex = 0;

    for (const city of cities) {
      for (let i = 1; i <= 5; i++) {
        const name = names[nameIndex % names.length];
        const email = `${name.toLowerCase().replace(/\s/g, ".")}${i}@fework.com`;
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        const user = await User.create({
          name: name,
          email: email,
          password: "password123",
          role: "worker",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, "")}`,
          isVerified: true
        });

        await Worker.create({
          user: user._id,
          category: category,
          bio: `Professional ${category} with over 8 years of experience in ${city}. Committed to excellence and customer satisfaction.`,
          hourlyRate: 250 + Math.floor(Math.random() * 500),
          experience: (2 + Math.floor(Math.random() * 12)).toString(),
          city: city,
          state: "Kerala",
          rating: 4 + (Math.random() * 0.9),
          totalJobs: 20 + Math.floor(Math.random() * 200),
          isAvailable: true
        });

        nameIndex++;
      }
    }

    console.log("✅ Seeded 10 new workers with realistic names (5 Kochi, 5 Kozhikode)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedWorkers();
