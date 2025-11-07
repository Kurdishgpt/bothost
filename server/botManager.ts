import { Client, GatewayIntentBits } from "discord.js";
import { storage } from "./storage";
import type { Bot } from "@shared/schema";
import { EventEmitter } from "events";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface BotProcess {
  botId: string;
  client: Client;
  status: "starting" | "online" | "error" | "offline";
  startTime: Date;
  logs: Array<{ timestamp: Date; level: string; message: string }>;
}

class BotManager extends EventEmitter {
  private processes: Map<string, BotProcess> = new Map();
  private readonly MAX_LOGS = 100;
  private metricsInterval: NodeJS.Timeout | null = null;
  private readonly METRICS_INTERVAL_MS = 15000; // 15 seconds
  private cachedDiskMb: number = 0;
  private diskCacheCount: number = 0;
  private readonly DISK_CACHE_CYCLES = 12; // Update disk every 12 cycles (3 minutes)
  private lastCpuUsage = process.cpuUsage();
  private lastCpuTime = Date.now();

  constructor() {
    super();
    this.initializeDiskCache();
    this.startMetricsCollection();
  }

  private async initializeDiskCache(): Promise<void> {
    try {
      const { stdout } = await execAsync('du -sm . 2>/dev/null || echo "0"');
      this.cachedDiskMb = parseInt(stdout.trim().split('\t')[0]) || 0;
    } catch (error) {
      this.cachedDiskMb = 0;
    }
  }

  async startBot(botId: string): Promise<void> {
    const bot = await storage.getBotById(botId);
    if (!bot) {
      throw new Error("Bot not found");
    }

    // Stop existing process if running
    if (this.processes.has(botId)) {
      await this.stopBot(botId);
    }

    // Create Discord client
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    const process: BotProcess = {
      botId,
      client,
      status: "starting",
      startTime: new Date(),
      logs: [],
    };

    this.processes.set(botId, process);
    await storage.updateBotStatus(botId, "starting");
    this.emit("status", { botId, status: "starting" });

    // Add log helper
    const addLog = (level: string, message: string) => {
      const log = { timestamp: new Date(), level, message };
      process.logs.push(log);
      if (process.logs.length > this.MAX_LOGS) {
        process.logs.shift();
      }
      this.emit("log", { botId, log });
    };

    // Setup Discord client event handlers
    client.on("ready", async () => {
      process.status = "online";
      await storage.updateBotStatus(botId, "online");
      this.emit("status", { botId, status: "online" });
      addLog("info", `Bot logged in as ${client.user?.tag}`);
    });

    client.on("error", async (error) => {
      addLog("error", `Discord client error: ${error.message}`);
      process.status = "error";
      await storage.updateBotStatus(botId, "error");
      this.emit("status", { botId, status: "error" });
    });

    client.on("disconnect", async () => {
      addLog("warn", "Bot disconnected from Discord");
    });

    client.on("messageCreate", (message) => {
      if (!message.author.bot) {
        addLog("info", `Message from ${message.author.tag}: ${message.content.substring(0, 50)}`);
      }
    });

    // Login to Discord
    try {
      addLog("info", "Attempting to connect to Discord...");
      await client.login(bot.token);
    } catch (error: any) {
      process.status = "error";
      await storage.updateBotStatus(botId, "error");
      this.emit("status", { botId, status: "error" });
      addLog("error", `Failed to login: ${error.message}`);
      throw new Error(`Failed to start bot: ${error.message}`);
    }
  }

  async stopBot(botId: string): Promise<void> {
    const process = this.processes.get(botId);
    if (!process) {
      return;
    }

    try {
      process.client.destroy();
      this.processes.delete(botId);
      await storage.updateBotStatus(botId, "offline");
      this.emit("status", { botId, status: "offline" });
    } catch (error: any) {
      console.error(`Error stopping bot ${botId}:`, error);
    }
  }

  async restartBot(botId: string): Promise<void> {
    await this.stopBot(botId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.startBot(botId);
  }

  getStatus(botId: string): string {
    const process = this.processes.get(botId);
    return process?.status || "offline";
  }

  getLogs(botId: string): Array<{ timestamp: Date; level: string; message: string }> {
    const process = this.processes.get(botId);
    return process?.logs || [];
  }

  getUptime(botId: string): number {
    const process = this.processes.get(botId);
    if (!process || process.status !== "online") {
      return 0;
    }
    return Date.now() - process.startTime.getTime();
  }

  async stopAll(): Promise<void> {
    const promises = Array.from(this.processes.keys()).map((botId) =>
      this.stopBot(botId)
    );
    await Promise.all(promises);
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics();
    }, this.METRICS_INTERVAL_MS);
  }

  private async collectMetrics(): Promise<void> {
    const activeBots = Array.from(this.processes.keys()).filter(
      (botId) => this.getStatus(botId) === "online"
    );

    if (activeBots.length === 0) {
      return;
    }

    const metrics = await this.getSystemMetrics();
    
    for (const botId of activeBots) {
      try {
        await storage.createMetric({
          botId,
          cpuPercent: metrics.cpu / activeBots.length,
          memoryMb: metrics.memory / activeBots.length,
          diskMb: metrics.disk,
        });
        
        this.emit("metrics", { botId, metrics: {
          cpu: metrics.cpu / activeBots.length,
          memory: metrics.memory / activeBots.length,
          disk: metrics.disk,
        }});
      } catch (error) {
        console.error(`Error storing metrics for bot ${botId}:`, error);
      }
    }
  }

  private async getSystemMetrics(): Promise<{ cpu: number; memory: number; disk: number }> {
    const memoryUsage = process.memoryUsage();
    const memoryMb = memoryUsage.heapUsed / 1024 / 1024;

    const now = Date.now();
    const currentCpuUsage = process.cpuUsage(this.lastCpuUsage);
    const elapsedMs = now - this.lastCpuTime;
    
    const totalCpuMs = (currentCpuUsage.user + currentCpuUsage.system) / 1000;
    const cpuPercent = Math.min(100, (totalCpuMs / elapsedMs) * 100);
    
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = now;

    this.diskCacheCount++;
    if (this.diskCacheCount >= this.DISK_CACHE_CYCLES) {
      try {
        const { stdout } = await execAsync('du -sm . 2>/dev/null || echo "0"');
        this.cachedDiskMb = parseInt(stdout.trim().split('\t')[0]) || 0;
      } catch (error) {
        this.cachedDiskMb = 0;
      }
      this.diskCacheCount = 0;
    }

    return {
      cpu: Math.round(cpuPercent * 100) / 100,
      memory: Math.round(memoryMb * 100) / 100,
      disk: this.cachedDiskMb,
    };
  }
}

export const botManager = new BotManager();
