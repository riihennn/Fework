"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const User_model_1 = __importDefault(require("./models/User.model"));
const Worker_model_1 = __importDefault(require("./models/Worker.model"));
const db_1 = __importDefault(require("./config/db"));
const firstNames = [
    "Rahul", "Arjun", "Vishnu", "Siddharth", "Aditya", "Abhishek", "Kiran", "Manoj", "Suresh", "Ramesh",
    "Anish", "Deepak", "Gautam", "Harish", "Ishan", "Jatin", "Karthik", "Lokesh", "Mohit", "Nitin",
    "Pankaj", "Rohan", "Sameer", "Tarun", "Umesh", "Varun", "Yash", "Zeeshan", "Aravind", "Biju",
    "Chandran", "Dinesh", "Eshwar", "Faisal", "Ganesh", "Haneef", "Indrajith", "Jayesh", "Krishnan", "Lal"
];
const lastNames = [
    "Nair", "Menon", "Das", "Pillai", "Prasad", "Varma", "Suresh", "Rajan", "Lakshmi", "Kumar",
    "Pillai", "Nambiar", "Panicker", "Kurup", "Warrior", "Iyer", "Sarma", "Gupta", "Sharma", "Singh"
];
const categories = ["plumber", "electrician", "ac", "cleaner", "painter", "carpenter", "mechanic", "mason"];
const cities = ["Kozhikode", "Kochi", "Thrissur"];
const seedWorkers = async () => {
    try {
        await (0, db_1.default)();
        // 1. Clear existing workers and their users
        // We'll find users with @fework.com emails which we used for seeding
        const existingSeedUsers = await User_model_1.default.find({ email: { $regex: /@fework\.com$/ } });
        const userIds = existingSeedUsers.map(u => u._id);
        await Worker_model_1.default.deleteMany({ user: { $in: userIds } });
        await User_model_1.default.deleteMany({ _id: { $in: userIds } });
        console.log("🗑️ Cleared old seed data");
        // 2. Seed new workers
        let totalSeeded = 0;
        for (const category of categories) {
            for (let i = 1; i <= 5; i++) {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const name = `${firstName} ${lastName}`;
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${category}.${i}@fework.com`;
                const city = cities[Math.floor(Math.random() * cities.length)];
                const user = await User_model_1.default.create({
                    name: name,
                    email: email,
                    password: "password123",
                    role: "worker",
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, "")}`,
                    isVerified: true
                });
                await Worker_model_1.default.create({
                    user: user._id,
                    category: category,
                    skills: [category, "Repair", "Maintenance"],
                    bio: `Experienced ${category} specialist based in ${city}. Providing high-quality, reliable services for all your ${category} needs. Professional and punctual.`,
                    hourlyRate: 300 + Math.floor(Math.random() * 400),
                    experience: (3 + Math.floor(Math.random() * 15)).toString(),
                    city: city,
                    state: "Kerala",
                    rating: 4.2 + (Math.random() * 0.7),
                    totalJobs: 50 + Math.floor(Math.random() * 300),
                    isAvailable: true
                });
                totalSeeded++;
            }
        }
        console.log(`✅ Successfully seeded ${totalSeeded} workers (5 per category) in ${cities.join(", ")}`);
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};
seedWorkers();
//# sourceMappingURL=seed.js.map