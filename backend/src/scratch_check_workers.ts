import mongoose from "mongoose";
import Worker from "./models/Worker.model";
import "dotenv/config";

async function check() {
  await mongoose.connect(process.env.MONGO_URI!);
  const categories = await Worker.distinct("category");
  console.log("Unique Categories in DB:", categories);
  const workers = await Worker.find().populate("user");
  console.log("Total Workers:", workers.length);
  workers.forEach(w => console.log("- ID:", w._id, "Name:", (w.user as any)?.name, "Category:", w.category));
  await mongoose.disconnect();
}
check();
