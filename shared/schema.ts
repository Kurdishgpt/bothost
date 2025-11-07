import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Bot table - stores Discord bot configurations
export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  token: text("token").notNull(), // Encrypted Discord bot token
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("offline"), // online, offline, starting, error
  entryPoint: varchar("entry_point", { length: 500 }).default("index.js"), // Main file to run
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;

// Bot files table - stores uploaded files for each bot
export const botFiles = pgTable("bot_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 500 }).notNull(),
  path: varchar("path", { length: 1000 }).notNull(), // Relative path within bot directory
  content: text("content").notNull(),
  size: varchar("size", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBotFileSchema = createInsertSchema(botFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBotFile = z.infer<typeof insertBotFileSchema>;
export type BotFile = typeof botFiles.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bots: many(bots),
}));

export const botsRelations = relations(bots, ({ one, many }) => ({
  user: one(users, {
    fields: [bots.userId],
    references: [users.id],
  }),
  files: many(botFiles),
}));

export const botFilesRelations = relations(botFiles, ({ one }) => ({
  bot: one(bots, {
    fields: [botFiles.botId],
    references: [bots.id],
  }),
}));
