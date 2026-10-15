import mongoose from "mongoose";
import dns from "dns";

// Configure reliable DNS servers for SRV resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignored in non-node or browser contexts
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isFailed: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null, isFailed: false };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (cached!.isFailed) {
    return null;
  }

  if (!MONGODB_URI) {
    cached!.isFailed = true;
    return null;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500, // Quick timeout to avoid blocking requests
      connectTimeoutMS: 2500,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((instance) => {
      return instance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (e) {
    cached!.promise = null;
    cached!.isFailed = true;
    console.warn("MongoDB connection failed, activating fallback storage:", (e as Error).message);
    return null;
  }
}
