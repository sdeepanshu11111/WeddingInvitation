import { type Db, MongoClient } from "mongodb";

/* The private database (MongoDB: MONGODB_URI, database MONGODB_DB or "invite_studio"), connected once per server
   instance and shared by its collections: `leads` (contact details, lib/server/leads.ts) and `links` (a record of
   every invite link, lib/server/links.ts). On globalThis so dev hot-reloads reuse the pool instead of opening a new
   one each time. */

const g = globalThis as unknown as { __mongoDb?: Promise<Db> };

export function mongoDb(): Promise<Db> {
  g.__mongoDb ??= new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
    .connect()
    .then((client) => client.db(process.env.MONGODB_DB || "invite_studio"))
    .catch((e) => {
      g.__mongoDb = undefined; // try again on the next call
      throw e;
    });
  return g.__mongoDb;
}
