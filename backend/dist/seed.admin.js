"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = __importDefault(require("./models/User.model"));
async function seedAdmin() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    const email = "admin@fework.com";
    const existingAdmin = await User_model_1.default.findOne({ email });
    if (!existingAdmin) {
        const hashedPassword = await bcryptjs_1.default.hash("Admin@123", 12);
        await User_model_1.default.create({
            name: "Admin User",
            email,
            password: hashedPassword,
            role: "admin",
            isVerified: true,
            phone: "+910000000000",
            avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
        });
        console.log(`✅ Admin created: ${email} / Admin@123`);
    }
    else {
        console.log(`✅ Admin already exists: ${email}`);
    }
    await mongoose_1.default.disconnect();
}
seedAdmin().catch(console.error);
//# sourceMappingURL=seed.admin.js.map