import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

// Neon requires a URL at init time even though it connects lazily.
// Provide a structurally-valid fallback so the module loads during `next build`
// when DATABASE_URL is not yet set (e.g. on CI before secrets are injected).
// Actual queries will fail at runtime if the real URL is missing.
const url = process.env.DATABASE_URL ?? "postgresql://build:build@localhost/build";

const sql = neon(url);
export const db = drizzle(sql, { schema: { ...schema, ...authSchema } });
