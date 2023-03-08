import { MongoClient } from "mongodb";
import { env } from "../../env/server.mjs";

if (!env.MONGODB_URI) {
  throw new Error('Invalid environment variable: "MONGODB_URI"');
}

const uri = env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise: Promise<MongoClient>;
  };

  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
