import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const useNeon =
  process.env.NODE_ENV === "production" &&
  (process.env.USE_NEON_DATABASE === "true" ||
    process.env.EXTERNAL_DEPLOYMENT === "true");
const connectionString = useNeon
  ? process.env.NEON_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    useNeon
      ? "USE_NEON_DATABASE is enabled, but NEON_DATABASE_URL is not set."
      : "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
