// Database storage implementation - referenced from blueprint:javascript_database
import {
  users,
  bots,
  botFiles,
  type User,
  type UpsertUser,
  type Bot,
  type InsertBot,
  type BotFile,
  type InsertBotFile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
