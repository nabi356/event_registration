import mongoose from 'mongoose';
import dns from 'dns';

// Importing every model here registers its schema on the shared mongoose
// instance. Routes that only .populate() a model (with no direct query on it)
// would otherwise hit MissingSchemaError whenever their route module is the
// first to reach the database in a fresh process — e.g. GET /api/checkin/feed
// populates 'userId' without querying User directly.
import '@/models/User';
import '@/models/Event';
import '@/models/Registration';
import '@/models/CheckIn';
import '@/models/SecurityAlert';

// Fix Node.js SRV query resolution on Windows platforms
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in browser or restricted environments
}

const ATLAS_URI = 'mongodb+srv://dancernabi_db_user:Nabi2005@cluster0.blsmvvs.mongodb.net/eventra?retryWrites=true&w=majority&appName=Cluster0';
// An explicitly set MONGODB_URI is always authoritative — the previous guard
// silently discarded any loopback URI (localhost/127.0.0.1) and redirected to
// the hardcoded Atlas cluster, which surprised local-Mongo development setups.
const MONGODB_URI = process.env.MONGODB_URI?.trim() || ATLAS_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
