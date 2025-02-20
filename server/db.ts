
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { userLogs } from "../shared/db";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

export async function logUserLogin(username: string, showCount: number) {
  await db.insert(userLogs).values({
    id: crypto.randomUUID(),
    username,
    showCount,
    timestamp: new Date(),
  });
}
