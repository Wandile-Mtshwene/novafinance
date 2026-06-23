import { config } from "dotenv";
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL);

const migrationFile = "./drizzle/0000_cloudy_mentallo.sql";
const content = readFileSync(migrationFile, "utf8");

// Split on drizzle's statement breakpoint marker
const statements = content
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`Applying ${statements.length} SQL statements...`);

let applied = 0;
let skipped = 0;
for (const stmt of statements) {
  if (!stmt) continue;
  try {
    // Neon requires tagged template literal — use the raw query method
    await sql.query(stmt);
    applied++;
  } catch (err) {
    const msg = err.message ?? "";
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      skipped++;
    } else {
      console.error("Error:", msg.slice(0, 150));
      console.error("  Statement:", stmt.slice(0, 80));
    }
  }
}

console.log(`\nDone. Applied: ${applied}, Skipped (already existed): ${skipped}`);
