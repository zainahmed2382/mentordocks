import { MongoClient, MongoClientOptions, Db, Collection } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";
import dotenv from "dotenv";

dotenv.config();

const mongoOptions: MongoClientOptions = {
  appName: "mentordocks",
  maxIdleTimeMS: 5000,
};

function getMongoUri(): string | undefined {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return undefined;

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    console.warn("[Mongo] Invalid MONGODB_URI format. MongoDB support disabled until a valid connection string is configured.");
    return undefined;
  }

  return uri;
}

const mongoUri = getMongoUri();
export const mongoClient: MongoClient | null = mongoUri ? new MongoClient(mongoUri, mongoOptions) : null;

let mongoDb: Db | null = null;
let mongoInitPromise: Promise<Db | null> | null = null;

if (mongoClient) {
  try {
    attachDatabasePool(mongoClient as any);
  } catch (error) {
    console.warn("[Mongo] attachDatabasePool is unavailable in this environment.");
  }
}

export async function connectMongoDb(): Promise<Db | null> {
  if (!mongoClient || !mongoUri) {
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

  const counterCollection = collection as unknown as Collection<{ _id: string; value: number }>;
  const result = await counterCollection.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  return Number(result?.value ?? 1);
}

export function isMongoConfigured(): boolean {
  return Boolean(getMongoUri());
}
