"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = __importDefault(require("./models/User.model"));
async function fixWorkerPasswords() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    // Hash the password exactly ONCE
    const correctHashedPassword = await bcryptjs_1.default.hash("Worker@123", 12);
    // Update all workers in the database without triggering the Mongoose pre-save hook
    const result = await User_model_1.default.updateMany({ role: "worker" }, { $set: { password: correctHashedPassword } });
    console.log(`✅ Fixed double-hashing! Updated ${result.modifiedCount} workers.`);
    await mongoose_1.default.disconnect();
}
fixWorkerPasswords().catch(console.error);
//# sourceMappingURL=fix.workers.js.map