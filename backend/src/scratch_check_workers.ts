import mongoose from "mongoose";
import Worker from "./models/Worker.model";
import "dotenv/config";

async function check() {
  await mongoose.connect(process.env.MONGO_URI!);
  const workers = await Worker.find().populate("user");
  console.log("Total Workers:", workers.length);
  workers.forEach(w => console.log("- ID:", w._id, "Name:", (w.user as any)?.name));
  await mongoose.disconnect();
}
check();
