const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

// ─── Schemas ─────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, phone: String, role: String, avatar: String, isVerified: Boolean }, { timestamps: true });
const WorkerSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, category: String, bio: String, hourlyRate: Number, experience: String, location: String, city: String, state: String, pincode: String, rating: Number, totalJobs: Number, isAvailable: Boolean, isElite: Boolean }, { timestamps: true });

const User = mongoose.model("User", UserSchema);
const Worker = mongoose.model("Worker", WorkerSchema);

const workers = [
  { name: "Rajan Kumar",    email: "rajan@fework.com",    category: "plumber",      bio: "Expert in pipe fitting, leakages and bathroom fittings.", experience: "7", hourlyRate: 350, city: "Mumbai",    state: "Maharashtra", rating: 4.8, totalJobs: 112, isElite: true  },
  { name: "Anita Sharma",   email: "anita@fework.com",    category: "electrician",  bio: "Certified electrician specializing in home wiring and MCB panels.", experience: "5", hourlyRate: 400, city: "Delhi",     state: "Delhi",       rating: 4.9, totalJobs: 89,  isElite: true  },
  { name: "Suresh Pillai",  email: "suresh@fework.com",   category: "carpenter",    bio: "Furniture repair, custom woodwork and modular kitchen installation.", experience: "10", hourlyRate: 300, city: "Bangalore", state: "Karnataka",  rating: 4.7, totalJobs: 200, isElite: false },
  { name: "Priya Nair",     email: "priya@fework.com",    category: "cleaner",      bio: "Deep cleaning specialist for homes, offices and post-renovation spaces.", experience: "4", hourlyRate: 250, city: "Chennai",   state: "Tamil Nadu",  rating: 4.6, totalJobs: 156, isElite: false },
  { name: "Vikram Singh",   email: "vikram@fework.com",   category: "painter",      bio: "Interior and exterior painting with premium quality finishes.", experience: "8", hourlyRate: 320, city: "Pune",      state: "Maharashtra", rating: 4.8, totalJobs: 98,  isElite: true  },
  { name: "Mohammed Ali",   email: "mali@fework.com",     category: "ac",           bio: "AC installation, gas refill, coil cleaning and full servicing.", experience: "6", hourlyRate: 450, city: "Hyderabad", state: "Telangana",   rating: 4.9, totalJobs: 175, isElite: true  },
  { name: "Deepak Verma",   email: "deepak@fework.com",   category: "mechanic",     bio: "Two-wheeler and four-wheeler repair, home visit service available.", experience: "9", hourlyRate: 380, city: "Jaipur",    state: "Rajasthan",   rating: 4.5, totalJobs: 143, isElite: false },
  { name: "Lakshmi Devi",   email: "lakshmi@fework.com",  category: "cleaner",      bio: "Professional home cleaning with eco-friendly products.", experience: "3", hourlyRate: 220, city: "Kochi",     state: "Kerala",      rating: 4.7, totalJobs: 67,  isElite: false },
  { name: "Rajesh Gupta",   email: "rajesh@fework.com",   category: "mason",        bio: "Brick work, plastering, waterproofing and tile fixing expert.", experience: "12", hourlyRate: 340, city: "Ahmedabad", state: "Gujarat",     rating: 4.6, totalJobs: 230, isElite: false },
  { name: "Sanjay Patil",   email: "sanjay@fework.com",   category: "electrician",  bio: "Smart home wiring, CCTV installation and inverter setup.", experience: "6", hourlyRate: 420, city: "Nagpur",    state: "Maharashtra", rating: 4.8, totalJobs: 88,  isElite: true  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const hashedPassword = await bcrypt.hash("worker1234", 10);
  let created = 0;

  for (const w of workers) {
    const existing = await User.findOne({ email: w.email });
    if (existing) {
      console.log(`⚠️  Skipping ${w.name} (already exists)`);
      continue;
    }

    const user = await User.create({
      name: w.name,
      email: w.email,
      password: hashedPassword,
      role: "worker",
      isVerified: true,
      avatar: "",
    });

    await Worker.create({
      user: user._id,
      category: w.category,
      bio: w.bio,
      experience: w.experience,
      hourlyRate: w.hourlyRate,
      city: w.city,
      state: w.state,
      rating: w.rating,
      totalJobs: w.totalJobs,
      isAvailable: true,
      isElite: w.isElite,
    });

    console.log(`✅ Created: ${w.name} (${w.category} — ${w.city})`);
    created++;
  }

  console.log(`\n🎉 Seeded ${created} workers successfully!`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
