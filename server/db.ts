import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env file from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully');
}

let pool: Pool | null = null;
let db: any = null;

console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 'Set' : 'Not set');

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