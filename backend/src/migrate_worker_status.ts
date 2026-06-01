import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;
  const result = await db.collection("workers").updateMany(
    { verificationStatus: { $exists: false } },
    { $set: { verificationStatus: "approved" } }
  );

  console.log(`Updated ${result.modifiedCount} workers → verificationStatus: "approved"`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
