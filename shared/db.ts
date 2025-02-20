
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const userLogs = pgTable("user_logs", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  showCount: integer("show_count").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
