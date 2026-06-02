"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function migrate() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    const db = mongoose_1.default.connection.db;
    // Find all user IDs that are workers
    const workers = await db.collection("workers").find({}, { projection: { user: 1 } }).toArray();
    const workerUserIds = workers.map((w) => w.user);
    // Clear address fields from their User documents
    const result = await db.collection("users").updateMany({ _id: { $in: workerUserIds } }, { $set: { city: "", address: "", state: "", pincode: "" } });
    console.log(`Cleared address from ${result.modifiedCount} worker User documents`);
    await mongoose_1.default.disconnect();
}
migrate().catch((err) => { console.error(err); process.exit(1); });
//# sourceMappingURL=migrate_clear_user_address.js.map