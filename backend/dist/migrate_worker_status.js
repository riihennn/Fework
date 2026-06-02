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
    const result = await db.collection("workers").updateMany({ verificationStatus: { $exists: false } }, { $set: { verificationStatus: "approved" } });
    console.log(`Updated ${result.modifiedCount} workers → verificationStatus: "approved"`);
    await mongoose_1.default.disconnect();
}
migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=migrate_worker_status.js.map