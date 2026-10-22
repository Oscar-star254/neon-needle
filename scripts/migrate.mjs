// Creates the bookings table in your Neon database.
// Usage:  DATABASE_URL="postgresql://..." pnpm db:migrate
import { readFile } from "node:fs/promises"
import { neon } from "@neondatabase/serverless"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("Set DATABASE_URL first (your Neon connection string).")
  process.exit(1)
}

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8")
const sql = neon(url)

// The Neon HTTP driver runs one statement at a time, so split the file.
const statements = schema
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean)

for (const statement of statements) await sql.query(statement)
console.log(`Done: ${statements.length} statements applied.`)
