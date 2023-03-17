import mongoose from "mongoose";
import { env } from "../../env/server.mjs";

const dbConnect = async () => {
  if (!env.MONGODB_URI) {
    throw new Error("Invalid/missing environment var: MONGODB_URI");
  }

  if (!env.MONGODB_DB_NAME) {
    throw new Error("Invalid/missing environment var: MONGODB_DB_NAME");
  }

  const uri = env.MONGODB_URI;
  const dbname = env.MONGODB_DB_NAME;

  await mongoose.connect(uri, {
    dbName: dbname,
  });
};

dbConnect().catch((err) => console.log(err));

export default dbConnect;
