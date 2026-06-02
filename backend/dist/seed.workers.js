"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Full DB Seed Script
 * Seeds 5 workers per skill with real human avatars from randomuser.me
 * Run: npx ts-node src/seed.workers.ts
 */
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = __importDefault(require("./models/User.model"));
const Worker_model_1 = __importDefault(require("./models/Worker.model"));
const KERALA_DISTRICTS = [
    { city: "Thiruvananthapuram", state: "Kerala", pincode: "695001", location: "MG Road, Thiruvananthapuram" },
    { city: "Kollam", state: "Kerala", pincode: "691001", location: "Chinnakada, Kollam" },
    { city: "Pathanamthitta", state: "Kerala", pincode: "689645", location: "Ring Road, Pathanamthitta" },
    { city: "Alappuzha", state: "Kerala", pincode: "688001", location: "Mullakkal, Alappuzha" },
    { city: "Kottayam", state: "Kerala", pincode: "686001", location: "Baker Junction, Kottayam" },
    { city: "Idukki", state: "Kerala", pincode: "685602", location: "Painavu, Idukki" },
    { city: "Ernakulam", state: "Kerala", pincode: "682001", location: "MG Road, Ernakulam" },
    { city: "Thrissur", state: "Kerala", pincode: "680001", location: "Round South, Thrissur" },
    { city: "Palakkad", state: "Kerala", pincode: "678001", location: "Victoria College Road, Palakkad" },
    { city: "Malappuram", state: "Kerala", pincode: "676505", location: "Calicut Road, Malappuram" },
    { city: "Kozhikode", state: "Kerala", pincode: "673001", location: "SM Street, Kozhikode" },
    { city: "Wayanad", state: "Kerala", pincode: "673121", location: "Kalpetta, Wayanad" },
    { city: "Kannur", state: "Kerala", pincode: "670001", location: "Fort Road, Kannur" },
    { city: "Kasaragod", state: "Kerala", pincode: "671121", location: "MG Road, Kasaragod" },
];
const INDIAN_MALE_NAMES = [
    "Arjun Nair", "Rahul Menon", "Vikram Pillai", "Suresh Kumar", "Anand Raj",
    "Pradeep Varma", "Sanjay Krishnan", "Deepak Mohan", "Arun Patel", "Kiran Sharma",
    "Mohammed Rafi", "Abdul Aziz", "Faizal Khan", "Shafeeq Rahman", "Rahim Babu",
    "Rajan Thampi", "Sijo Joseph", "Binu Mathew", "Sabu George", "Jijo Thomas",
    "Ajith Kumar", "Sreejith Nambiar", "Harikrishnan KP", "Manoj Chandran", "Vineeth Babu",
    "Shyam Sundar", "Govind Rajan", "Murali Krishna", "Prasad Unni", "Sathish Menon",
    "Bipin Bhaskar", "Cijin Jose", "Eldho Paul", "Firos Babu", "Gireesh Nair",
    "Haneef Mohammed", "Irfan Ali", "Jithin Raj", "Kunjumon PK", "Lijo Varghese",
    "Midhun Das", "Najeeb TK", "Oommen Cherian", "Prinson Philip", "Qadeer Ahmed",
    "Rejish Kumar", "Sajeev PV", "Tinson Thomas", "Unnikrishnan EM", "Vishal Raj",
    "Ashwin Nair", "Babu Cherian", "Deepu Krishnan", "Eldhose Jose", "Firoz Hussain",
    "Gokul Krishna", "Hashim Mohammed", "Indrajit Nair", "Jaison Philip", "Kevin Thomas",
    "Lal Mohan", "Midhun Raj", "Navas TM", "Ouseph Varghese", "Prabhu Shankar",
    "Rajesh Pillai", "Sivadas MK", "Thomaskutty Varghese", "Unni Krishnan", "Vinod Kumar",
    "Ajay Menon", "Balu Raj", "Chittan Nair", "Dinu Babu", "Edwin Joseph",
    "Felix Joseph", "Girish Babu", "Harris Khan", "Ijas Mohammed", "Jomon George",
];
const SKILLS = [
    // Repairs & Maintenance
    { category: "Repairs & Maintenance", skill: "Electrician", bio: "Certified electrician with expertise in home wiring, circuit breakers and power distribution." },
    { category: "Repairs & Maintenance", skill: "Plumber", bio: "Expert plumber specializing in pipe installation, leak repair and bathroom fittings." },
    { category: "Repairs & Maintenance", skill: "Carpenter", bio: "Skilled carpenter for custom furniture, door & window frames, and wooden fittings." },
    { category: "Repairs & Maintenance", skill: "Welder", bio: "Professional welder experienced in arc welding, gate fabrication and metal repairs." },
    // Electronics & Tech
    { category: "Electronics & Tech", skill: "AC Technician", bio: "AC installation, servicing and gas refilling expert for all major brands." },
    { category: "Electronics & Tech", skill: "TV Repair Technician", bio: "LCD, LED & Smart TV repair specialist with quick turnaround." },
    { category: "Electronics & Tech", skill: "Refrigerator Technician", bio: "Refrigerator and deep freezer repair with genuine spare parts." },
    { category: "Electronics & Tech", skill: "Washing Machine Technician", bio: "Front-load and top-load washing machine repair and servicing." },
    { category: "Electronics & Tech", skill: "Water Purifier Technician", bio: "RO & UV water purifier installation, filter change and servicing." },
    { category: "Electronics & Tech", skill: "Generator Technician", bio: "Generator maintenance, repair and installation for home and commercial units." },
    { category: "Electronics & Tech", skill: "CCTV Installer", bio: "CCTV camera installation and networking for homes and offices." },
    { category: "Electronics & Tech", skill: "Solar Panel Technician", bio: "Solar panel installation and maintenance for rooftop systems." },
    { category: "Electronics & Tech", skill: "Internet/WiFi Technician", bio: "Network setup, WiFi router configuration and broadband troubleshooting." },
    { category: "Electronics & Tech", skill: "Mobile Repair Technician", bio: "Mobile phone screen, battery and motherboard repair for all brands." },
    { category: "Electronics & Tech", skill: "Computer Technician", bio: "Laptop and desktop repair, OS installation and data recovery." },
    // Construction & Interior
    { category: "Construction & Interior", skill: "Mason", bio: "Brick and block laying, concrete work and plastering expert." },
    { category: "Construction & Interior", skill: "Tiles Worker", bio: "Floor and wall tile fixing with precision grouting and waterproofing." },
    { category: "Construction & Interior", skill: "Painter", bio: "Interior and exterior painting with texture and waterproofing options." },
    { category: "Construction & Interior", skill: "Steel Fabricator", bio: "Custom steel gate, grill and railing fabrication and installation." },
    { category: "Construction & Interior", skill: "False Ceiling Worker", bio: "Gypsum and PVC false ceiling design and installation specialist." },
    { category: "Construction & Interior", skill: "Interior Designer", bio: "Modern interior design concepts for living rooms, bedrooms and offices." },
    { category: "Construction & Interior", skill: "POP Worker", bio: "POP cornices, ceiling design and decorative moulding specialist." },
    { category: "Construction & Interior", skill: "Glass Installer", bio: "Glass partition, shower enclosure and window pane installation." },
    { category: "Construction & Interior", skill: "Roofing Worker", bio: "Roof waterproofing, tile roofing and metal sheet roofing expert." },
    // Cleaning & Outdoors
    { category: "Cleaning & Outdoors", skill: "House Cleaner", bio: "Professional home cleaning with eco-friendly products and equipment." },
    { category: "Cleaning & Outdoors", skill: "Deep Cleaning Worker", bio: "Deep cleaning service for kitchens, bathrooms and full-home sanitization." },
    { category: "Cleaning & Outdoors", skill: "Bathroom Cleaner", bio: "Specialized bathroom deep cleaning and tile descaling expert." },
    { category: "Cleaning & Outdoors", skill: "Gardener", bio: "Garden maintenance, plant care, lawn mowing and landscaping." },
    { category: "Cleaning & Outdoors", skill: "Tree Cutter", bio: "Tree trimming, pruning and removal services with safety equipment." },
];
// Real male human photos from randomuser.me (pre-fetched IDs that work reliably)
// Using picsum.photos with fixed seeds for consistent real human-looking photos
// Actually using thispersondoesnotexist won't work (no fixed URLs), so we'll use
// randomuser.me thumbnail URLs with known seeds.
// We use UIAvatars as fallback but the user wants real images.
// Using cloudinary sample real human faces (stock photos uploaded by community):
const REAL_AVATARS = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1563237023-b1e970526dcb?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1484186304347-ffd9c4a5d5c0?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1491349174775-aaaefdd81942?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
];
async function seed() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    // Removed wiping logic to allow resuming the seed
    console.log("▶ Resuming seeding without wiping existing data...");
    const hashedPassword = await bcryptjs_1.default.hash("Worker@123", 12);
    let workerIndex = 0;
    let nameIndex = 0;
    let total = 0;
    for (const { category, skill, bio } of SKILLS) {
        console.log(`\n🔧 Seeding: ${skill}`);
        for (const loc of KERALA_DISTRICTS) {
            for (let i = 0; i < 5; i++) {
                const name = INDIAN_MALE_NAMES[nameIndex % INDIAN_MALE_NAMES.length];
                const avatar = REAL_AVATARS[workerIndex % REAL_AVATARS.length];
                const rate = 200 + Math.floor(Math.random() * 800); // ₹200–₹1000
                const experience = `${1 + Math.floor(Math.random() * 12)} years`;
                const emailSlug = name.toLowerCase().replace(/\s+/g, ".") + (workerIndex + 1);
                const email = `${emailSlug}@fework.seed`;
                // Check if user already exists to skip
                const existing = await User_model_1.default.findOne({ email });
                if (existing) {
                    nameIndex++;
                    workerIndex++;
                    continue;
                }
                const user = await User_model_1.default.create({
                    name,
                    email,
                    password: hashedPassword,
                    role: "worker",
                    phone: `+91${9000000000 + workerIndex}`,
                    avatar,
                    isVerified: true,
                });
                await Worker_model_1.default.create({
                    user: user._id,
                    category: skill,
                    bio: `${bio} Based in ${loc.city}, Kerala.`,
                    skills: [skill],
                    hourlyRate: rate,
                    experience,
                    location: loc.location,
                    city: loc.city,
                    state: loc.state,
                    pincode: loc.pincode,
                    isAvailable: true,
                    verificationStatus: "approved",
                    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
                    totalJobs: Math.floor(Math.random() * 120),
                });
                nameIndex++;
                workerIndex++;
                total++;
            }
            console.log(`   ✓ ${loc.city} — 5 workers added`);
        }
    }
    console.log(`\n🎉 Done! Seeded ${total} workers across ${SKILLS.length} skills in 14 districts.`);
    await mongoose_1.default.disconnect();
}
seed().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); });
//# sourceMappingURL=seed.workers.js.map