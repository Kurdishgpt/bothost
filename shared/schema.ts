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

// Server types enum - programming languages and databases
export const serverTypeEnum = z.enum([
  "nodejs",
  "bun",
  "python",
  "java",
  "csharp",
  "rust",
  "lua",
  "mongodb",
  "mariadb",
  "redis",
  "postgresql",
]);

export const serverCategoryEnum = z.enum(["language", "database"]);

export type ServerType = z.infer<typeof serverTypeEnum>;
export type ServerCategory = z.infer<typeof serverCategoryEnum>;

// Servers table - stores server configurations (formerly bots)
export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  serverType: varchar("server_type", { length: 50 }).notNull().default("nodejs"), // nodejs, python, etc.
  category: varchar("category", { length: 50 }).notNull().default("language"), // language or database
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("offline"), // online, offline, starting, error
  entryFile: varchar("entry_file", { length: 500 }).default("index.js"), // Main file to run
  startupCommand: text("startup_command"), // Custom startup command/arguments
  gitRepoUrl: text("git_repo_url"), // Git repository address
  gitBranch: varchar("git_branch", { length: 255 }).default("main"), // Git branch to use
  gitUsername: varchar("git_username", { length: 255 }), // Git username for authentication
  gitAccessToken: text("git_access_token"), // Git access token (encrypted)
  autoUpdate: boolean("auto_update").default(false), // Auto update when git repo changes
  hasUserFiles: boolean("has_user_files").default(false), // Whether user uploaded files directly
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;

// Server files table - stores uploaded files for each server
export const serverFiles = pgTable("server_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 500 }).notNull(),
  path: varchar("path", { length: 1000 }).notNull(), // Relative path within server directory
  content: text("content").notNull(),
  size: varchar("size", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServerFileSchema = createInsertSchema(serverFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServerFile = z.infer<typeof insertServerFileSchema>;
export type ServerFile = typeof serverFiles.$inferSelect;

// Server environment variables table - stores encrypted environment variables per server
export const serverEnvVars = pgTable("server_env_vars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(), // Encrypted value
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServerEnvVarSchema = createInsertSchema(serverEnvVars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServerEnvVar = z.infer<typeof insertServerEnvVarSchema>;
export type ServerEnvVar = typeof serverEnvVars.$inferSelect;

// Server runtime configuration table - stores resource limits and 24/7 settings
export const serverRuntimeConfigs = pgTable("server_runtime_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().unique().references(() => servers.id, { onDelete: "cascade" }),
  cpuLimit: integer("cpu_limit").default(100), // CPU percentage limit
  memoryLimit: integer("memory_limit").default(512), // Memory limit in MB
  diskLimit: integer("disk_limit").default(1024), // Disk limit in MB
  alwaysOn: boolean("always_on").default(false), // 24/7 hosting flag
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServerRuntimeConfigSchema = createInsertSchema(serverRuntimeConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServerRuntimeConfig = z.infer<typeof insertServerRuntimeConfigSchema>;
export type ServerRuntimeConfig = typeof serverRuntimeConfigs.$inferSelect;

// Server runtime metrics table - stores resource usage snapshots
export const serverRuntimeMetrics = pgTable("server_runtime_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  cpuPercent: real("cpu_percent"), // CPU usage percentage
  memoryMb: real("memory_mb"), // Memory usage in MB
  diskMb: real("disk_mb"), // Disk usage in MB
  collectedAt: timestamp("collected_at").defaultNow(),
}, (table) => [
  index("IDX_metrics_server_collected").on(table.serverId, table.collectedAt),
]);

export const insertServerRuntimeMetricSchema = createInsertSchema(serverRuntimeMetrics).omit({
  id: true,
  collectedAt: true,
});

export type InsertServerRuntimeMetric = z.infer<typeof insertServerRuntimeMetricSchema>;
export type ServerRuntimeMetric = typeof serverRuntimeMetrics.$inferSelect;

// Server assets table - stores avatars and other files
export const serverAssets = pgTable("server_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // avatar, attachment, etc.
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  url: text("url"),
  size: integer("size"), // Size in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServerAssetSchema = createInsertSchema(serverAssets).omit({
  id: true,
  createdAt: true,
});

export type InsertServerAsset = z.infer<typeof insertServerAssetSchema>;
export type ServerAsset = typeof serverAssets.$inferSelect;

// Server packages table - stores npm packages per server
export const serverPackages = pgTable("server_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  source: varchar("source", { length: 20 }).default("npm"), // npm, github, etc.
  installedAt: timestamp("installed_at").defaultNow(),
});

export const insertServerPackageSchema = createInsertSchema(serverPackages).omit({
  id: true,
  installedAt: true,
});

export type InsertServerPackage = z.infer<typeof insertServerPackageSchema>;
export type ServerPackage = typeof serverPackages.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  servers: many(servers),
}));

export const serversRelations = relations(servers, ({ one, many }) => ({
  user: one(users, {
    fields: [servers.userId],
    references: [users.id],
  }),
  files: many(serverFiles),
  envVars: many(serverEnvVars),
  runtimeConfig: one(serverRuntimeConfigs),
  metrics: many(serverRuntimeMetrics),
  assets: many(serverAssets),
  packages: many(serverPackages),
}));

export const serverFilesRelations = relations(serverFiles, ({ one }) => ({
  server: one(servers, {
    fields: [serverFiles.serverId],
    references: [servers.id],
  }),
}));

export const serverEnvVarsRelations = relations(serverEnvVars, ({ one }) => ({
  server: one(servers, {
    fields: [serverEnvVars.serverId],
    references: [servers.id],
  }),
}));

export const serverRuntimeConfigsRelations = relations(serverRuntimeConfigs, ({ one }) => ({
  server: one(servers, {
    fields: [serverRuntimeConfigs.serverId],
    references: [servers.id],
  }),
}));

export const serverRuntimeMetricsRelations = relations(serverRuntimeMetrics, ({ one }) => ({
  server: one(servers, {
    fields: [serverRuntimeMetrics.serverId],
    references: [servers.id],
  }),
}));

export const serverAssetsRelations = relations(serverAssets, ({ one }) => ({
  server: one(servers, {
    fields: [serverAssets.serverId],
    references: [servers.id],
  }),
}));

export const serverPackagesRelations = relations(serverPackages, ({ one }) => ({
  server: one(servers, {
    fields: [serverPackages.serverId],
    references: [servers.id],
  }),
}));
