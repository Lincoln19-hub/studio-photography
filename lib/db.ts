import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __studioPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__studioPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__studioPostgresqlPool = pool;
}

export const db = drizzle(pool);

// Re-export for backward compatibility
export default db;
