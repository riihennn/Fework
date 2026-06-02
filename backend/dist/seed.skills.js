"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Skills Seed Script
 * Run: npx ts-node src/seed.skills.ts
 *
 * Seeds the SkillCategory and Skill collections with all
 * current platform skills, organized by category.
 */
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const Skill_model_1 = require("./models/Skill.model");
const SKILL_DATA = [
    {
        category: {
            name: "Repairs & Maintenance",
            slug: "repairs-maintenance",
            icon: "Wrench",
            description: "Electrical, plumbing, woodwork and general home repairs",
            sortOrder: 1,
        },
        skills: ["Electrician", "Plumber", "Carpenter", "Welder"],
    },
    {
        category: {
            name: "Electronics & Tech",
            slug: "electronics-tech",
            icon: "Tv",
            description: "Repair and installation of electronic devices and tech services",
            sortOrder: 2,
        },
        skills: [
            "AC Technician",
            "TV Repair Technician",
            "Refrigerator Technician",
            "Washing Machine Technician",
            "Water Purifier Technician",
            "Generator Technician",
            "CCTV Installer",
            "Solar Panel Technician",
            "Internet/WiFi Technician",
            "Mobile Repair Technician",
            "Computer Technician",
        ],
    },
    {
        category: {
            name: "Construction & Interior",
            slug: "construction-interior",
            icon: "Hammer",
            description: "Building, renovation, and interior finishing services",
            sortOrder: 3,
        },
        skills: [
            "Mason",
            "Tiles Worker",
            "Painter",
            "Steel Fabricator",
            "False Ceiling Worker",
            "Interior Designer",
            "POP Worker",
            "Glass Installer",
            "Roofing Worker",
        ],
    },
    {
        category: {
            name: "Cleaning & Outdoors",
            slug: "cleaning-outdoors",
            icon: "Sparkles",
            description: "Home cleaning, outdoor maintenance and landscaping",
            sortOrder: 4,
        },
        skills: [
            "House Cleaner",
            "Deep Cleaning Worker",
            "Bathroom Cleaner",
            "Gardener",
            "Tree Cutter",
        ],
    },
];
async function seed() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/fework";
    await mongoose_1.default.connect(uri);
    console.log("✅ Connected to MongoDB");
    for (const { category, skills } of SKILL_DATA) {
        // Upsert category
        const cat = await Skill_model_1.SkillCategory.findOneAndUpdate({ slug: category.slug }, {
            $set: {
                name: category.name,
                slug: category.slug,
                icon: category.icon,
                description: category.description,
                isActive: true,
                sortOrder: category.sortOrder,
            },
        }, { upsert: true, new: true });
        console.log(`📁 Category: ${cat.name}`);
        // Upsert skills
        for (let i = 0; i < skills.length; i++) {
            await Skill_model_1.Skill.findOneAndUpdate({ name: skills[i], category: category.name }, {
                $set: {
                    name: skills[i],
                    category: category.name,
                    isActive: true,
                    sortOrder: i,
                },
            }, { upsert: true, new: true });
            console.log(`   └─ ✓ ${skills[i]}`);
        }
    }
    const totalSkills = await Skill_model_1.Skill.countDocuments();
    const totalCats = await Skill_model_1.SkillCategory.countDocuments();
    console.log(`\n🎉 Seeded ${totalCats} categories and ${totalSkills} skills`);
    await mongoose_1.default.disconnect();
}
seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
//# sourceMappingURL=seed.skills.js.map