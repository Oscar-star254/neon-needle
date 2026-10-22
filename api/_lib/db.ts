import { neon } from "@neondatabase/serverless"

export type Row = Record<string, any>

/** Runs a parameterised query against Neon and returns the rows. */
export async function query(text: string, params: unknown[] = []): Promise<Row[]> {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const sql = neon(url)
  return (await sql.query(text, params)) as Row[]
}
