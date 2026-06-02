"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Worker_model_1 = __importDefault(require("./models/Worker.model"));
require("dotenv/config");
async function check() {
    await mongoose_1.default.connect(process.env.MONGO_URI);
    const categories = await Worker_model_1.default.distinct("category");
    console.log("Unique Categories in DB:", categories);
    const workers = await Worker_model_1.default.find().populate("user");
    console.log("Total Workers:", workers.length);
    workers.forEach(w => console.log("- ID:", w._id, "Name:", w.user?.name, "Category:", w.category));
    await mongoose_1.default.disconnect();
}
check();
//# sourceMappingURL=scratch_check_workers.js.map