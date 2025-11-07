// Database storage implementation - referenced from blueprint:javascript_database
import {
  users,
  bots,
  botFiles,
  botEnvVars,
  botRuntimeConfigs,
  botRuntimeMetrics,
  botAssets,
  botPackages,
  type User,
  type UpsertUser,
  type Bot,
  type InsertBot,
  type BotFile,
  type InsertBotFile,
  type BotEnvVar,
  type InsertBotEnvVar,
  type BotRuntimeConfig,
  type InsertBotRuntimeConfig,
  type BotRuntimeMetric,
  type InsertBotRuntimeMetric,
  type BotAsset,
  type InsertBotAsset,
  type BotPackage,
  type InsertBotPackage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Bot operations
  getBotsByUserId(userId: string): Promise<Bot[]>;
  getBotById(botId: string): Promise<Bot | undefined>;
  createBot(userId: string, bot: InsertBot): Promise<Bot>;
  updateBotStatus(botId: string, status: string): Promise<void>;
  updateBot(botId: string, updates: Partial<InsertBot>): Promise<Bot>;
  deleteBot(botId: string): Promise<void>;
  
  // File operations
  getFilesByBotId(botId: string): Promise<BotFile[]>;
  getFileById(fileId: string): Promise<BotFile | undefined>;
  createFile(file: InsertBotFile): Promise<BotFile>;
  updateFile(fileId: string, content: string): Promise<BotFile>;
  deleteFile(fileId: string): Promise<void>;
  deleteFilesByBotId(botId: string): Promise<void>;
  
  // Environment variables operations
  getEnvVarsByBotId(botId: string): Promise<BotEnvVar[]>;
  getEnvVarById(id: string): Promise<BotEnvVar | undefined>;
  createEnvVar(envVar: InsertBotEnvVar & { value: string }): Promise<BotEnvVar>;
  updateEnvVar(id: string, value: string): Promise<BotEnvVar>;
  deleteEnvVar(id: string): Promise<void>;
  
  // Runtime config operations
  getRuntimeConfig(botId: string): Promise<BotRuntimeConfig | undefined>;
  upsertRuntimeConfig(config: InsertBotRuntimeConfig): Promise<BotRuntimeConfig>;
  
  // Runtime metrics operations
  createMetric(metric: InsertBotRuntimeMetric): Promise<BotRuntimeMetric>;
  getLatestMetrics(botId: string, limit?: number): Promise<BotRuntimeMetric[]>;
  
  // Assets operations
  getAssetsByBotId(botId: string): Promise<BotAsset[]>;
  getAssetById(id: string): Promise<BotAsset | undefined>;
  createAsset(asset: InsertBotAsset): Promise<BotAsset>;
  deleteAsset(id: string): Promise<void>;
  
  // Packages operations
  getPackagesByBotId(botId: string): Promise<BotPackage[]>;
  getPackageById(id: string): Promise<BotPackage | undefined>;
  createPackage(pkg: InsertBotPackage): Promise<BotPackage>;
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

  // Bot operations
  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return await db.select().from(bots).where(eq(bots.userId, userId));
  }

  async getBotById(botId: string): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, botId));
    return bot;
  }

  async createBot(userId: string, botData: InsertBot): Promise<Bot> {
    const [bot] = await db
      .insert(bots)
      .values({
        ...botData,
        userId,
      })
      .returning();
    return bot;
  }

  async updateBotStatus(botId: string, status: string): Promise<void> {
    await db
      .update(bots)
      .set({ status, updatedAt: new Date() })
      .where(eq(bots.id, botId));
  }

  async updateBot(botId: string, updates: Partial<InsertBot>): Promise<Bot> {
    const [bot] = await db
      .update(bots)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bots.id, botId))
      .returning();
    return bot;
  }

  async deleteBot(botId: string): Promise<void> {
    await db.delete(bots).where(eq(bots.id, botId));
  }

  // File operations
  async getFilesByBotId(botId: string): Promise<BotFile[]> {
    return await db.select().from(botFiles).where(eq(botFiles.botId, botId));
  }

  async getFileById(fileId: string): Promise<BotFile | undefined> {
    const [file] = await db.select().from(botFiles).where(eq(botFiles.id, fileId));
    return file;
  }

  async createFile(fileData: InsertBotFile): Promise<BotFile> {
    const [file] = await db.insert(botFiles).values(fileData).returning();
    return file;
  }

  async updateFile(fileId: string, content: string): Promise<BotFile> {
    const [file] = await db
      .update(botFiles)
      .set({ content, updatedAt: new Date() })
      .where(eq(botFiles.id, fileId))
      .returning();
    return file;
  }

  async deleteFile(fileId: string): Promise<void> {
    await db.delete(botFiles).where(eq(botFiles.id, fileId));
  }

  async deleteFilesByBotId(botId: string): Promise<void> {
    await db.delete(botFiles).where(eq(botFiles.botId, botId));
  }

  // Environment variables operations
  async getEnvVarsByBotId(botId: string): Promise<BotEnvVar[]> {
    return await db.select().from(botEnvVars).where(eq(botEnvVars.botId, botId));
  }

  async getEnvVarById(id: string): Promise<BotEnvVar | undefined> {
    const [envVar] = await db.select().from(botEnvVars).where(eq(botEnvVars.id, id));
    return envVar;
  }

  async createEnvVar(envVar: InsertBotEnvVar & { value: string }): Promise<BotEnvVar> {
    const encryptedValue = this.encryptValue(envVar.value);
    const [created] = await db
      .insert(botEnvVars)
      .values({
        ...envVar,
        value: encryptedValue,
      })
      .returning();
    return created;
  }

  async updateEnvVar(id: string, value: string): Promise<BotEnvVar> {
    const encryptedValue = this.encryptValue(value);
    const [updated] = await db
      .update(botEnvVars)
      .set({ value: encryptedValue, updatedAt: new Date() })
      .where(eq(botEnvVars.id, id))
      .returning();
    return updated;
  }

  async deleteEnvVar(id: string): Promise<void> {
    await db.delete(botEnvVars).where(eq(botEnvVars.id, id));
  }

  // Runtime config operations
  async getRuntimeConfig(botId: string): Promise<BotRuntimeConfig | undefined> {
    const [config] = await db
      .select()
      .from(botRuntimeConfigs)
      .where(eq(botRuntimeConfigs.botId, botId));
    return config;
  }

  async upsertRuntimeConfig(config: InsertBotRuntimeConfig): Promise<BotRuntimeConfig> {
    const [result] = await db
      .insert(botRuntimeConfigs)
      .values(config)
      .onConflictDoUpdate({
        target: botRuntimeConfigs.botId,
        set: {
          ...config,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Runtime metrics operations
  async createMetric(metric: InsertBotRuntimeMetric): Promise<BotRuntimeMetric> {
    const [created] = await db.insert(botRuntimeMetrics).values(metric).returning();
    return created;
  }

  async getLatestMetrics(botId: string, limit: number = 50): Promise<BotRuntimeMetric[]> {
    return await db
      .select()
      .from(botRuntimeMetrics)
      .where(eq(botRuntimeMetrics.botId, botId))
      .orderBy(desc(botRuntimeMetrics.collectedAt))
      .limit(limit);
  }

  // Assets operations
  async getAssetsByBotId(botId: string): Promise<BotAsset[]> {
    return await db.select().from(botAssets).where(eq(botAssets.botId, botId));
  }

  async getAssetById(id: string): Promise<BotAsset | undefined> {
    const [asset] = await db.select().from(botAssets).where(eq(botAssets.id, id));
    return asset;
  }

  async createAsset(asset: InsertBotAsset): Promise<BotAsset> {
    const [created] = await db.insert(botAssets).values(asset).returning();
    return created;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(botAssets).where(eq(botAssets.id, id));
  }

  // Packages operations
  async getPackagesByBotId(botId: string): Promise<BotPackage[]> {
    return await db.select().from(botPackages).where(eq(botPackages.botId, botId));
  }

  async getPackageById(id: string): Promise<BotPackage | undefined> {
    const [pkg] = await db.select().from(botPackages).where(eq(botPackages.id, id));
    return pkg;
  }

  async createPackage(pkg: InsertBotPackage): Promise<BotPackage> {
    const [created] = await db.insert(botPackages).values(pkg).returning();
    return created;
  }

  async deletePackage(id: string): Promise<void> {
    await db.delete(botPackages).where(eq(botPackages.id, id));
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
