import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL is not set in environment variables. Defaulting to empty string which may cause errors.");
}

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || "",
    },
    verbose: true,
    strict: true,
} satisfies Config;
