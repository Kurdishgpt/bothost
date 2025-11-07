// API routes with authentication - referenced from blueprint:javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { botManager } from "./botManager";
import { 
  insertBotSchema, 
  insertBotFileSchema,
  insertBotEnvVarSchema,
  insertBotRuntimeConfigSchema,
  insertBotAssetSchema,
  insertBotPackageSchema,
} from "@shared/schema";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

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

  app.post("/api/bots/:botId/files", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      let content: string;
      let filename: string;
      let path: string;
      let size: string;
      
      // Handle multipart file upload
      if (req.file) {
        const buffer = req.file.buffer;
        filename = req.body.filename || req.file.originalname;
        path = req.body.path || "/home/container/";
        
        // Comprehensive text file detection
        const textExtensions = /\.(js|ts|jsx|tsx|json|md|txt|html|css|py|java|cpp|c|h|sh|yml|yaml|xml|ini|conf|cfg|env|gitignore|dockerfile|makefile|toml|rs|go|rb|php|sql|graphql|vue|svelte|bat|ps1)$/i;
        const hasTextExtension = textExtensions.test(filename);
        const hasTextMime = req.file.mimetype.startsWith('text/') || 
                           req.file.mimetype.includes('json') || 
                           req.file.mimetype.includes('xml') ||
                           req.file.mimetype.includes('yaml');
        
        // Try to detect if content is text by checking if it's valid UTF-8
        let isTextContent = false;
        try {
          const decoded = buffer.toString('utf-8');
          // Check if decoded string contains only printable characters and common whitespace
          isTextContent = /^[\x09\x0A\x0D\x20-\x7E\x80-\xFF]*$/.test(decoded.substring(0, Math.min(1024, decoded.length)));
        } catch (e) {
          isTextContent = false;
        }
        
        const isBinary = !hasTextExtension && !hasTextMime && !isTextContent;
        
        if (isBinary) {
          // Store binary files as base64 data URL
          content = `data:${req.file.mimetype || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
        } else {
          // Store text files as plain text
          content = buffer.toString('utf-8');
        }
        
        size = `${(buffer.length / 1024).toFixed(2)} KB`;
      }
      // Fallback to JSON format for backward compatibility
      else {
        const bodyData = req.body;
        filename = bodyData.filename;
        path = bodyData.path;
        content = bodyData.content;
        size = bodyData.size;
      }
      
      const fileData = insertBotFileSchema.parse({ 
        botId,
        filename,
        path,
        content,
        size
      });
      
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
      
      const { content, filename, path } = req.body;
      const updatedFile = await storage.updateFile(fileId, content, filename, path);
      
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

  // Environment variables routes
  app.get("/api/bots/:botId/env", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const envVars = await storage.getEnvVarsByBotId(botId);
      const sanitizedEnvVars = envVars.map(ev => ({
        ...ev,
        value: undefined,
      }));
      
      res.json(sanitizedEnvVars);
    } catch (error) {
      console.error("Error fetching env vars:", error);
      res.status(500).json({ message: "Failed to fetch environment variables" });
    }
  });

  app.post("/api/bots/:botId/env", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const envVarData = insertBotEnvVarSchema.parse({ ...req.body, botId });
      const envVar = await storage.createEnvVar(envVarData);
      
      res.json({ ...envVar, value: undefined });
    } catch (error: any) {
      console.error("Error creating env var:", error);
      res.status(400).json({ message: error.message || "Failed to create environment variable" });
    }
  });

  app.patch("/api/env/:envId", isAuthenticated, async (req: any, res) => {
    try {
      const { envId } = req.params;
      const envVar = await storage.getEnvVarById(envId);
      
      if (!envVar) {
        return res.status(404).json({ message: "Environment variable not found" });
      }
      
      const bot = await storage.getBotById(envVar.botId);
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { value } = req.body;
      const updated = await storage.updateEnvVar(envId, value);
      
      res.json({ ...updated, value: undefined });
    } catch (error) {
      console.error("Error updating env var:", error);
      res.status(500).json({ message: "Failed to update environment variable" });
    }
  });

  app.delete("/api/env/:envId", isAuthenticated, async (req: any, res) => {
    try {
      const { envId } = req.params;
      const envVar = await storage.getEnvVarById(envId);
      
      if (!envVar) {
        return res.status(404).json({ message: "Environment variable not found" });
      }
      
      const bot = await storage.getBotById(envVar.botId);
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteEnvVar(envId);
      res.json({ message: "Environment variable deleted successfully" });
    } catch (error) {
      console.error("Error deleting env var:", error);
      res.status(500).json({ message: "Failed to delete environment variable" });
    }
  });

  // Runtime config routes
  app.get("/api/bots/:botId/config", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const config = await storage.getRuntimeConfig(botId);
      res.json(config || {
        botId,
        cpuLimit: 100,
        memoryLimit: 512,
        diskLimit: 1024,
        alwaysOn: false,
      });
    } catch (error) {
      console.error("Error fetching runtime config:", error);
      res.status(500).json({ message: "Failed to fetch runtime config" });
    }
  });

  app.put("/api/bots/:botId/config", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const configData = insertBotRuntimeConfigSchema.parse({ ...req.body, botId });
      const config = await storage.upsertRuntimeConfig(configData);
      
      res.json(config);
    } catch (error: any) {
      console.error("Error updating runtime config:", error);
      res.status(400).json({ message: error.message || "Failed to update runtime config" });
    }
  });

  // Metrics routes
  app.get("/api/bots/:botId/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const metrics = await storage.getLatestMetrics(botId, limit);
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Assets routes (photo upload)
  app.get("/api/bots/:botId/assets", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const assets = await storage.getAssetsByBotId(botId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post("/api/bots/:botId/assets", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileData = req.file.buffer.toString('base64');
      const storageKey = `${botId}/${req.file.originalname}`;
      
      const asset = await storage.createAsset({
        botId,
        type: req.body.type || 'avatar',
        storageKey,
        url: `data:${req.file.mimetype};base64,${fileData}`,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
      
      res.json(asset);
    } catch (error: any) {
      console.error("Error uploading asset:", error);
      res.status(400).json({ message: error.message || "Failed to upload asset" });
    }
  });

  app.delete("/api/assets/:assetId", isAuthenticated, async (req: any, res) => {
    try {
      const { assetId } = req.params;
      const asset = await storage.getAssetById(assetId);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      const bot = await storage.getBotById(asset.botId);
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteAsset(assetId);
      res.json({ message: "Asset deleted successfully" });
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Packages routes
  app.get("/api/bots/:botId/packages", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const packages = await storage.getPackagesByBotId(botId);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.post("/api/bots/:botId/packages", isAuthenticated, async (req: any, res) => {
    try {
      const { botId } = req.params;
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const pkgData = insertBotPackageSchema.parse({ ...req.body, botId });
      const pkg = await storage.createPackage(pkgData);
      
      res.json(pkg);
    } catch (error: any) {
      console.error("Error adding package:", error);
      res.status(400).json({ message: error.message || "Failed to add package" });
    }
  });

  app.delete("/api/packages/:packageId", isAuthenticated, async (req: any, res) => {
    try {
      const { packageId } = req.params;
      const pkg = await storage.getPackageById(packageId);
      
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      
      const bot = await storage.getBotById(pkg.botId);
      if (!bot || bot.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deletePackage(packageId);
      res.json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ message: "Failed to delete package" });
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

    const metricsListener = (data: any) => {
      ws.send(JSON.stringify({ type: "metrics", data }));
    };

    botManager.on("status", statusListener);
    botManager.on("log", logListener);
    botManager.on("metrics", metricsListener);

    ws.on("close", () => {
      botManager.off("status", statusListener);
      botManager.off("log", logListener);
      botManager.off("metrics", metricsListener);
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
