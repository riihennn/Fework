import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;

  // Find all user IDs that are workers
  const workers = await db.collection("workers").find({}, { projection: { user: 1 } }).toArray();
  const workerUserIds = workers.map((w: any) => w.user);

  // Clear address fields from their User documents
  const result = await db.collection("users").updateMany(
    { _id: { $in: workerUserIds } },
    { $set: { city: "", address: "", state: "", pincode: "" } }
  );

  console.log(`Cleared address from ${result.modifiedCount} worker User documents`);
  await mongoose.disconnect();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
