import dotenv from "dotenv";
import path from "path";

// Load environment variables from server/.env for local development
// This module MUST be imported before any other modules that depend on env vars
//
// Note hard-coded path BS because imrtport.meta.dirname is undefined in
// Docker environment.
const ENV_FILE_PATH = path.join(import.meta.dirname || "/app/dist", ".env");
console.log(`Loading environment from: ${ENV_FILE_PATH}`);

const result = dotenv.config({ path: ENV_FILE_PATH });

if (result.error && process.env.NODE_ENV !== "production") {
  console.warn("Warning: Could not load .env file:", result.error.message);
} else if (result.parsed) {
  console.log("Environment variables loaded successfully");
  // Don't log the actual values for security
  console.log("Available env vars:", Object.keys(result.parsed).join(", "));
}

// Export config values for use by other modules
export const config = {
  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY_ENV_VAR ||
    "default_key",
  MAILCHIMP_API_KEY:
    process.env.MAILCHIMP_API_KEY ||
    process.env.MAILCHIMP_API_KEY_ENV_VAR ||
    "default_key",
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 4001,
};

console.log(
  `OPENAI_API_KEY loaded: ${config.OPENAI_API_KEY !== "default_key" ? "YES" : "NO (using default)"}`,
  `MAILCHIMP_API_KEY loaded: ${config.MAILCHIMP_API_KEY !== "default_key" ? "YES" : "NO (using default)"}`,
);
