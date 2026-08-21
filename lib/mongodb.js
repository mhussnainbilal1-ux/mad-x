import mongoose from "mongoose";

const globalCache = globalThis;

if (!globalCache.madxMongoose) {
  globalCache.madxMongoose = { connection: null, promise: null };
}

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const error = new Error("MONGODB_URI is not configured");
    error.code = "MONGODB_NOT_CONFIGURED";
    throw error;
  }

  if (globalCache.madxMongoose.connection) {
    return globalCache.madxMongoose.connection;
  }

  if (!globalCache.madxMongoose.promise) {
    globalCache.madxMongoose.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    globalCache.madxMongoose.connection =
      await globalCache.madxMongoose.promise;
  } catch (error) {
    globalCache.madxMongoose.promise = null;
    throw error;
  }

  return globalCache.madxMongoose.connection;
}
