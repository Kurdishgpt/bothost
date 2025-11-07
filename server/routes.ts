// API routes with authentication - referenced from blueprint:javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { botManager } from "./botManager";
import { insertBotSchema, insertBotFileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Bot routes
  app.get("/api/bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bots = await storage.getBotsByUserId(userId);
      
      // Add runtime status and uptime
      const botsWithStatus = bots.map((bot) => ({
        ...bot,
        token: undefined, // Never send token to frontend
        runtimeStatus: botManager.getStatus(bot.id),
        uptime: botManager.getUptime(bot.id),
      }));
      
      res.json(botsWithStatus);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.get("/api/bots/:botId", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      res.json({
        ...bot,
        token: undefined,
        runtimeStatus: botManager.getStatus(bot.id),
        uptime: botManager.getUptime(bot.id),
      });
    } catch (error) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  app.post("/api/bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const botData = insertBotSchema.parse(req.body);
      
      const bot = await storage.createBot(userId, botData);
      res.json({ ...bot, token: undefined });
    } catch (error: any) {
      console.error("Error creating bot:", error);
      res.status(400).json({ message: error.message || "Failed to create bot" });
    }
  });

  app.patch("/api/bots/:botId", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const updates = insertBotSchema.partial().parse(req.body);
      const updatedBot = await storage.updateBot(botId, updates);
      
      res.json({ ...updatedBot, token: undefined });
    } catch (error: any) {
      console.error("Error updating bot:", error);
      res.status(400).json({ message: error.message || "Failed to update bot" });
    }
  });

  app.delete("/api/bots/:botId", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      // Stop bot if running
      await botManager.stopBot(botId);
      
      // Delete files and bot
      await storage.deleteFilesByBotId(botId);
      await storage.deleteBot(botId);
      
      res.json({ message: "Bot deleted successfully" });
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  // Bot control routes
  app.post("/api/bots/:botId/start", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      await botManager.startBot(botId);
      res.json({ message: "Bot starting" });
    } catch (error: any) {
      console.error("Error starting bot:", error);
      res.status(500).json({ message: error.message || "Failed to start bot" });
    }
  });

  app.post("/api/bots/:botId/stop", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      await botManager.stopBot(botId);
      res.json({ message: "Bot stopped" });
    } catch (error) {
      console.error("Error stopping bot:", error);
      res.status(500).json({ message: "Failed to stop bot" });
    }
  });

  app.post("/api/bots/:botId/restart", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      await botManager.restartBot(botId);
      res.json({ message: "Bot restarting" });
    } catch (error: any) {
      console.error("Error restarting bot:", error);
      res.status(500).json({ message: error.message || "Failed to restart bot" });
    }
  });

  app.get("/api/bots/:botId/logs", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const logs = botManager.getLogs(botId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // File routes
  app.get("/api/bots/:botId/files", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const files = await storage.getFilesByBotId(botId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/bots/:botId/files", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const fileData = insertBotFileSchema.parse({ ...req.body, botId });
      const file = await storage.createFile(fileData);
      
      res.json(file);
    } catch (error: any) {
      console.error("Error creating file:", error);
      res.status(400).json({ message: error.message || "Failed to create file" });
    }
  });

  app.patch("/api/files/:fileId", isAuthenticated, async (req: any, res) => {
    try {
      const { fileId } = req.params;
      const file = await storage.getFileById(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const bot = await storage.getBotById(file.botId);
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { content } = req.body;
      const updatedFile = await storage.updateFile(fileId, content);
      
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete("/api/files/:fileId", isAuthenticated, async (req: any, res) => {
    try {
      const { fileId } = req.params;
      const file = await storage.getFileById(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const bot = await storage.getBotById(file.botId);
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteFile(fileId);
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");

    const statusListener = (data: any) => {
      ws.send(JSON.stringify({ type: "status", data }));
    };

    const logListener = (data: any) => {
      ws.send(JSON.stringify({ type: "log", data }));
    };

    botManager.on("status", statusListener);
    botManager.on("log", logListener);

    ws.on("close", () => {
      botManager.off("status", statusListener);
      botManager.off("log", logListener);
      console.log("WebSocket client disconnected");
    });
  });

  // Cleanup on shutdown
  process.on("SIGTERM", async () => {
    await botManager.stopAll();
    process.exit(0);
  });

  return httpServer;
}
