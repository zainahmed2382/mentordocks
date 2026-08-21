import { MongoClient, MongoClientOptions, Db, Collection } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";
import dotenv from "dotenv";

dotenv.config();

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
      mongoDb = mongoClient.db(process.env.MONGODB_DB || "mentordocks");
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

export async function getMongoCollection(name: string): Promise<Collection | null> {
  const db = await connectMongoDb();
  return db ? db.collection(name) : null;
}

export async function ensureMongoCollections(): Promise<void> {
  const db = await connectMongoDb();
  if (!db) return;

  const collections = ["users", "projects", "scans", "counters"];

  for (const name of collections) {
    const exists = await db.listCollections({ name }).hasNext();
    if (!exists) {
      await db.createCollection(name);
    }
  }

  await db.collection("users").createIndex({ email: 1 }, { unique: true, sparse: false });
  await db.collection("projects").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("scans").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("counters").createIndex({ _id: 1 }, { unique: true });

  console.log("[Mongo] Collections and indexes are ready.");
}

export async function getNextSequenceValue(sequenceName: string): Promise<number> {
  const collection = await getMongoCollection("counters");
  if (!collection) return Date.now();

  const result = await collection.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  return Number(result?.value ?? 1);
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}
