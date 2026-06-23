import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL);

const statements = [
  `CREATE TABLE IF NOT EXISTS "fin_auth_user" (
    "id" text PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" boolean NOT NULL,
    "image" text,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "fin_auth_session" (
    "id" text PRIMARY KEY,
    "expires_at" timestamp NOT NULL,
    "token" text NOT NULL UNIQUE,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "user_id" text NOT NULL REFERENCES "fin_auth_user"("id") ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "fin_auth_account" (
    "id" text PRIMARY KEY,
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "user_id" text NOT NULL REFERENCES "fin_auth_user"("id") ON DELETE CASCADE,
    "access_token" text,
    "refresh_token" text,
    "id_token" text,
    "access_token_expires_at" timestamp,
    "refresh_token_expires_at" timestamp,
    "scope" text,
    "password" text,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "fin_auth_verification" (
    "id" text PRIMARY KEY,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp,
    "updated_at" timestamp
  )`,
];

console.log("Creating auth tables...");
let applied = 0;
for (const stmt of statements) {
  try {
    await sql.query(stmt);
    applied++;
    console.log("✓", stmt.trim().split("\n")[0].slice(0, 60));
  } catch (err) {
    console.error("✗", err.message.slice(0, 100));
  }
}
console.log(`\nDone. ${applied}/${statements.length} tables created.`);
