// Database storage implementation - referenced from blueprint:javascript_database
import {
  users,
  servers,
  serverFiles,
  serverEnvVars,
  serverRuntimeConfigs,
  serverRuntimeMetrics,
  serverAssets,
  serverPackages,
  type User,
  type UpsertUser,
  type Server,
  type InsertServer,
  type ServerFile,
  type InsertServerFile,
  type ServerEnvVar,
  type InsertServerEnvVar,
  type ServerRuntimeConfig,
  type InsertServerRuntimeConfig,
  type ServerRuntimeMetric,
  type InsertServerRuntimeMetric,
  type ServerAsset,
  type InsertServerAsset,
  type ServerPackage,
  type InsertServerPackage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Server operations
  getServersByUserId(userId: string): Promise<Server[]>;
  getServerById(serverId: string): Promise<Server | undefined>;
  createServer(userId: string, server: InsertServer): Promise<Server>;
  updateServerStatus(serverId: string, status: string): Promise<void>;
  updateServer(serverId: string, updates: Partial<InsertServer>): Promise<Server>;
  deleteServer(serverId: string): Promise<void>;

  // File operations
  getFilesByServerId(serverId: string): Promise<ServerFile[]>;
  getFileById(fileId: string): Promise<ServerFile | undefined>;
  createFile(file: InsertServerFile): Promise<ServerFile>;
  updateFile(fileId: string, content?: string, filename?: string, path?: string): Promise<ServerFile>;
  deleteFile(fileId: string): Promise<void>;
  deleteFilesByServerId(serverId: string): Promise<void>;

  // Environment variables operations
  getEnvVarsByServerId(serverId: string): Promise<ServerEnvVar[]>;
  getEnvVarById(id: string): Promise<ServerEnvVar | undefined>;
  createEnvVar(envVar: InsertServerEnvVar & { value: string }): Promise<ServerEnvVar>;
  updateEnvVar(id: string, value: string): Promise<ServerEnvVar>;
  deleteEnvVar(id: string): Promise<void>;

  // Runtime config operations
  getRuntimeConfig(serverId: string): Promise<ServerRuntimeConfig | undefined>;
  upsertRuntimeConfig(config: InsertServerRuntimeConfig): Promise<ServerRuntimeConfig>;

  // Runtime metrics operations
  createMetric(metric: InsertServerRuntimeMetric): Promise<ServerRuntimeMetric>;
  getLatestMetrics(serverId: string, limit?: number): Promise<ServerRuntimeMetric[]>;

  // Assets operations
  getAssetsByServerId(serverId: string): Promise<ServerAsset[]>;
  getAssetById(id: string): Promise<ServerAsset | undefined>;
  createAsset(asset: InsertServerAsset): Promise<ServerAsset>;
  deleteAsset(id: string): Promise<void>;

  // Packages operations
  getPackagesByServerId(serverId: string): Promise<ServerPackage[]>;
  getPackageById(id: string): Promise<ServerPackage | undefined>;
  createPackage(pkg: InsertServerPackage): Promise<ServerPackage>;
  deletePackage(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Server operations
  async getServersByUserId(userId: string): Promise<Server[]> {
    return await db.select().from(servers).where(eq(servers.userId, userId));
  }

  async getServerById(serverId: string): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.id, serverId));
    return server;
  }

  async createServer(userId: string, serverData: InsertServer): Promise<Server> {
    const [server] = await db
      .insert(servers)
      .values({
        ...serverData,
        userId,
      })
      .returning();
    return server;
  }

  async updateServerStatus(serverId: string, status: string): Promise<void> {
    await db
      .update(servers)
      .set({ status, updatedAt: new Date() })
      .where(eq(servers.id, serverId));
  }

  async updateServer(serverId: string, updates: Partial<InsertServer>): Promise<Server> {
    const [server] = await db
      .update(servers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(servers.id, serverId))
      .returning();
    return server;
  }

  async deleteServer(serverId: string): Promise<void> {
    await db.delete(servers).where(eq(servers.id, serverId));
  }

  // File operations
  async getFilesByServerId(serverId: string): Promise<ServerFile[]> {
    return await db.select().from(serverFiles).where(eq(serverFiles.serverId, serverId));
  }

  async getFileById(fileId: string): Promise<ServerFile | undefined> {
    const [file] = await db.select().from(serverFiles).where(eq(serverFiles.id, fileId));
    return file;
  }

  async createFile(fileData: InsertServerFile): Promise<ServerFile> {
    const [file] = await db.insert(serverFiles).values(fileData).returning();
    return file;
  }

  async updateFile(id: string, content?: string, filename?: string, path?: string): Promise<ServerFile> {
    const updateData: any = { updatedAt: new Date() };
    if (content !== undefined) updateData.content = content;
    if (filename !== undefined) updateData.filename = filename;
    if (path !== undefined) updateData.path = path;

    const [file] = await db
      .update(serverFiles)
      .set(updateData)
      .where(eq(serverFiles.id, id))
      .returning();
    return file;
  }

  async deleteFile(fileId: string): Promise<void> {
    await db.delete(serverFiles).where(eq(serverFiles.id, fileId));
  }

  async deleteFilesByServerId(serverId: string): Promise<void> {
    await db.delete(serverFiles).where(eq(serverFiles.serverId, serverId));
  }

  // Environment variables operations
  async getEnvVarsByServerId(serverId: string): Promise<ServerEnvVar[]> {
    return await db.select().from(serverEnvVars).where(eq(serverEnvVars.serverId, serverId));
  }

  async getEnvVarById(id: string): Promise<ServerEnvVar | undefined> {
    const [envVar] = await db.select().from(serverEnvVars).where(eq(serverEnvVars.id, id));
    return envVar;
  }

  async createEnvVar(envVar: InsertServerEnvVar & { value: string }): Promise<ServerEnvVar> {
    const encryptedValue = this.encryptValue(envVar.value);
    const [created] = await db
      .insert(serverEnvVars)
      .values({
        ...envVar,
        value: encryptedValue,
      })
      .returning();
    return created;
  }

  async updateEnvVar(id: string, value: string): Promise<ServerEnvVar> {
    const encryptedValue = this.encryptValue(value);
    const [updated] = await db
      .update(serverEnvVars)
      .set({ value: encryptedValue, updatedAt: new Date() })
      .where(eq(serverEnvVars.id, id))
      .returning();
    return updated;
  }

  async deleteEnvVar(id: string): Promise<void> {
    await db.delete(serverEnvVars).where(eq(serverEnvVars.id, id));
  }

  // Runtime config operations
  async getRuntimeConfig(serverId: string): Promise<ServerRuntimeConfig | undefined> {
    const [config] = await db
      .select()
      .from(serverRuntimeConfigs)
      .where(eq(serverRuntimeConfigs.serverId, serverId));
    return config;
  }

  async upsertRuntimeConfig(config: InsertServerRuntimeConfig): Promise<ServerRuntimeConfig> {
    const [result] = await db
      .insert(serverRuntimeConfigs)
      .values(config)
      .onConflictDoUpdate({
        target: serverRuntimeConfigs.serverId,
        set: {
          ...config,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Runtime metrics operations
  async createMetric(metric: InsertServerRuntimeMetric): Promise<ServerRuntimeMetric> {
    const [created] = await db.insert(serverRuntimeMetrics).values(metric).returning();
    return created;
  }

  async getLatestMetrics(serverId: string, limit: number = 50): Promise<ServerRuntimeMetric[]> {
    return await db
      .select()
      .from(serverRuntimeMetrics)
      .where(eq(serverRuntimeMetrics.serverId, serverId))
      .orderBy(desc(serverRuntimeMetrics.collectedAt))
      .limit(limit);
  }

  // Assets operations
  async getAssetsByServerId(serverId: string): Promise<ServerAsset[]> {
    return await db.select().from(serverAssets).where(eq(serverAssets.serverId, serverId));
  }

  async getAssetById(id: string): Promise<ServerAsset | undefined> {
    const [asset] = await db.select().from(serverAssets).where(eq(serverAssets.id, id));
    return asset;
  }

  async createAsset(asset: InsertServerAsset): Promise<ServerAsset> {
    const [created] = await db.insert(serverAssets).values(asset).returning();
    return created;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(serverAssets).where(eq(serverAssets.id, id));
  }

  // Packages operations
  async getPackagesByServerId(serverId: string): Promise<ServerPackage[]> {
    return await db.select().from(serverPackages).where(eq(serverPackages.serverId, serverId));
  }

  async getPackageById(id: string): Promise<ServerPackage | undefined> {
    const [pkg] = await db.select().from(serverPackages).where(eq(serverPackages.id, id));
    return pkg;
  }

  async createPackage(pkg: InsertServerPackage): Promise<ServerPackage> {
    const [created] = await db.insert(serverPackages).values(pkg).returning();
    return created;
  }

  async deletePackage(id: string): Promise<void> {
    await db.delete(serverPackages).where(eq(serverPackages.id, id));
  }

  // Helper methods for encryption
  private encryptValue(value: string): string {
    const algorithm = 'aes-256-gcm';
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex'),
    });
  }

  decryptValue(encryptedData: string): string {
    const algorithm = 'aes-256-gcm';
    const key = this.getEncryptionKey();
    const data = JSON.parse(encryptedData);

    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(data.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
      throw new Error("ENCRYPTION_SECRET environment variable must be set for secure encryption");
    }
    return crypto.scryptSync(secret, 'salt', 32);
  }
}

export const storage = new DatabaseStorage();