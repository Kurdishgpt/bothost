import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
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

// Bot environment variables table - stores encrypted environment variables per bot
export const botEnvVars = pgTable("bot_env_vars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(), // Encrypted value
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBotEnvVarSchema = createInsertSchema(botEnvVars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBotEnvVar = z.infer<typeof insertBotEnvVarSchema>;
export type BotEnvVar = typeof botEnvVars.$inferSelect;

// Bot runtime configuration table - stores resource limits and 24/7 settings
export const botRuntimeConfigs = pgTable("bot_runtime_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().unique().references(() => bots.id, { onDelete: "cascade" }),
  cpuLimit: integer("cpu_limit").default(100), // CPU percentage limit
  memoryLimit: integer("memory_limit").default(512), // Memory limit in MB
  diskLimit: integer("disk_limit").default(1024), // Disk limit in MB
  alwaysOn: boolean("always_on").default(false), // 24/7 hosting flag
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBotRuntimeConfigSchema = createInsertSchema(botRuntimeConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBotRuntimeConfig = z.infer<typeof insertBotRuntimeConfigSchema>;
export type BotRuntimeConfig = typeof botRuntimeConfigs.$inferSelect;

// Bot runtime metrics table - stores resource usage snapshots
export const botRuntimeMetrics = pgTable("bot_runtime_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  cpuPercent: real("cpu_percent"), // CPU usage percentage
  memoryMb: real("memory_mb"), // Memory usage in MB
  diskMb: real("disk_mb"), // Disk usage in MB
  collectedAt: timestamp("collected_at").defaultNow(),
}, (table) => [
  index("IDX_metrics_bot_collected").on(table.botId, table.collectedAt),
]);

export const insertBotRuntimeMetricSchema = createInsertSchema(botRuntimeMetrics).omit({
  id: true,
  collectedAt: true,
});

export type InsertBotRuntimeMetric = z.infer<typeof insertBotRuntimeMetricSchema>;
export type BotRuntimeMetric = typeof botRuntimeMetrics.$inferSelect;

// Bot assets table - stores avatars and other files
export const botAssets = pgTable("bot_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // avatar, attachment, etc.
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  url: text("url"),
  size: integer("size"), // Size in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBotAssetSchema = createInsertSchema(botAssets).omit({
  id: true,
  createdAt: true,
});

export type InsertBotAsset = z.infer<typeof insertBotAssetSchema>;
export type BotAsset = typeof botAssets.$inferSelect;

// Bot packages table - stores npm packages per bot
export const botPackages = pgTable("bot_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  source: varchar("source", { length: 20 }).default("npm"), // npm, github, etc.
  installedAt: timestamp("installed_at").defaultNow(),
});

export const insertBotPackageSchema = createInsertSchema(botPackages).omit({
  id: true,
  installedAt: true,
});

export type InsertBotPackage = z.infer<typeof insertBotPackageSchema>;
export type BotPackage = typeof botPackages.$inferSelect;

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
  envVars: many(botEnvVars),
  runtimeConfig: one(botRuntimeConfigs),
  metrics: many(botRuntimeMetrics),
  assets: many(botAssets),
  packages: many(botPackages),
}));

export const botFilesRelations = relations(botFiles, ({ one }) => ({
  bot: one(bots, {
    fields: [botFiles.botId],
    references: [bots.id],
  }),
}));

export const botEnvVarsRelations = relations(botEnvVars, ({ one }) => ({
  bot: one(bots, {
    fields: [botEnvVars.botId],
    references: [bots.id],
  }),
}));

export const botRuntimeConfigsRelations = relations(botRuntimeConfigs, ({ one }) => ({
  bot: one(bots, {
    fields: [botRuntimeConfigs.botId],
    references: [bots.id],
  }),
}));

export const botRuntimeMetricsRelations = relations(botRuntimeMetrics, ({ one }) => ({
  bot: one(bots, {
    fields: [botRuntimeMetrics.botId],
    references: [bots.id],
  }),
}));

export const botAssetsRelations = relations(botAssets, ({ one }) => ({
  bot: one(bots, {
    fields: [botAssets.botId],
    references: [bots.id],
  }),
}));

export const botPackagesRelations = relations(botPackages, ({ one }) => ({
  bot: one(bots, {
    fields: [botPackages.botId],
    references: [bots.id],
  }),
}));
