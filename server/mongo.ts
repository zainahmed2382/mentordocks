import { MongoClient, MongoClientOptions, Db } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const mongoOptions: MongoClientOptions = {
  appName: "mentordocks",
  maxIdleTimeMS: 5000,
};

export const mongoClient = new MongoClient(process.env.MONGODB_URI || "", mongoOptions);

let mongoDb: Db | null = null;
let mongoInitPromise: Promise<Db | null> | null = null;

if (process.env.MONGODB_URI) {
  try {
    attachDatabasePool(mongoClient as any);
  } catch (error) {
    console.warn("[Mongo] attachDatabasePool is unavailable in this environment.");
  }
}

export async function connectMongoDb(): Promise<Db | null> {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  if (mongoDb) {
    return mongoDb;
  }

  if (!mongoInitPromise) {
    mongoInitPromise = (async () => {
      await mongoClient.connect();
      mongoDb = mongoClient.db();
      console.log("[Mongo] Connected to MongoDB Atlas.");
      return mongoDb;
    })().catch((error) => {
      mongoInitPromise = null;
      console.error("[Mongo] Connection failed:", error);
      return null;
    });
  }

  return mongoInitPromise;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}
