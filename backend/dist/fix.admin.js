"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const User_model_1 = __importDefault(require("./models/User.model"));
async function fixAdmin() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    // Delete the messed up admin account
    await User_model_1.default.deleteOne({ email: "admin@fework.com" });
    // Create it properly (letting Mongoose pre-save hook hash it)
    await User_model_1.default.create({
        name: "Admin User",
        email: "admin@fework.com",
        password: "Admin@123", // DO NOT pre-hash it
        role: "admin",
        isVerified: true,
        phone: "+910000000000",
        avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    });
    console.log(`✅ Admin recreated correctly: admin@fework.com / Admin@123`);
    await mongoose_1.default.disconnect();
}
fixAdmin().catch(console.error);
//# sourceMappingURL=fix.admin.js.map