import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: NeonDatabase<typeof schema> | null = null;

if (process.env.DATABASE_URL) {
  // If DATABASE_URL is available, use PostgreSQL database
  console.log("Using PostgreSQL database");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // If DATABASE_URL is not available, we'll use in-memory storage
  // The actual fallback implementation is in storage.ts
  console.log("DATABASE_URL not set, will use in-memory storage fallback");
  pool = null;
  db = null;
}

export { pool, db };
