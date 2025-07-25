import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// In Docker/production, environment variables are provided by the container runtime
// No need to load .env files in this context
console.log('Environment check - NODE_ENV:', process.env.NODE_ENV);
console.log('Environment check - DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

let pool: Pool | null = null;
let db: any = null;


if (process.env.DATABASE_URL) {
  // If DATABASE_URL is available, use PostgreSQL database
  console.log("Using PostgreSQL database");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  // If DATABASE_URL is not available, we'll use in-memory storage
  // The actual fallback implementation is in storage.ts
  console.log("DATABASE_URL not set, will use in-memory storage fallback");
  console.log('Current working directory:', process.cwd());
  pool = null;
  db = null;
}

export { pool, db };