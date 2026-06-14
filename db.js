// backend/db.js
import pkg from "pg";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
const { Pool } = pkg;

// Support Supabase (DATABASE_URL) or local Postgres (individual vars)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "yourpassword",
      database: process.env.DB_NAME || "techcity_db",
      port: process.env.DB_PORT || 5432
    };

export const pool = new Pool(poolConfig);

// Test connection
pool.connect()
  .then(() => console.log("PostgreSQL connected ✔️"))
  .catch(err => console.error("DB connection error ❌", err));