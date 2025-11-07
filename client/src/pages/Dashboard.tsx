import { useState } from "react";
import { BotCard, type Bot } from "@/components/BotCard";
import { StatsCard } from "@/components/StatsCard";
import { AddBotDialog } from "@/components/AddBotDialog";
import { LogsDialog } from "@/components/LogsDialog";
import { EmptyState } from "@/components/EmptyState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bot as BotIcon, Activity, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  // TODO: remove mock functionality
  const [bots, setBots] = useState<Bot[]>([
    {
      id: "1",
      name: "Music Bot",
      status: "online",
      uptime: "2d 5h 32m",
      memoryUsage: "128 MB",
      lastRestart: "2 days ago",
    },
    {
      id: "2",
      name: "Moderation Bot",
      status: "online",
      uptime: "5d 12h 8m",
      memoryUsage: "64 MB",
      lastRestart: "5 days ago",
    },
    {
      id: "3",
      name: "Welcome Bot",
      status: "offline",
      uptime: "0m",
      memoryUsage: "0 MB",
      lastRestart: "1 hour ago",
    },
    {
      id: "4",
      name: "Utility Bot",
      status: "starting",
      uptime: "0m",
      memoryUsage: "32 MB",
      lastRestart: "Just now",
    },
  ]);

  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const mockLogs = [
    { timestamp: "2024-01-15 14:23:45", level: "info" as const, message: "Bot started successfully" },
    { timestamp: "2024-01-15 14:23:46", level: "info" as const, message: "Connected to Discord gateway" },
    { timestamp: "2024-01-15 14:23:47", level: "info" as const, message: `Logged in as ${selectedBot?.name || 'Bot'}#1234` },
    { timestamp: "2024-01-15 14:24:12", level: "warn" as const, message: "High memory usage detected: 256MB" },
    { timestamp: "2024-01-15 14:25:33", level: "info" as const, message: "Command received: /play" },
    { timestamp: "2024-01-15 14:26:01", level: "error" as const, message: "Failed to connect to voice channel: Permission denied" },
  ];

  const activeBots = bots.filter((bot) => bot.status === "online").length;
  const totalUptime = "12d 8h";

  const handleStart = (botId: string) => {
    console.log("Starting bot:", botId);
    setBots((prev) =>
      prev.map((bot) =>
        bot.id === botId ? { ...bot, status: "starting" as const } : bot
      )
    );
    setTimeout(() => {
      setBots((prev) =>
        prev.map((bot) =>
          bot.id === botId ? { ...bot, status: "online" as const, uptime: "1m" } : bot
        )
      );
    }, 2000);
  };

  const handleStop = (botId: string) => {
    console.log("Stopping bot:", botId);
    setBots((prev) =>
      prev.map((bot) =>
        bot.id === botId ? { ...bot, status: "offline" as const, uptime: "0m" } : bot
      )
    );
  };

  const handleRestart = (botId: string) => {
    console.log("Restarting bot:", botId);
    setBots((prev) =>
      prev.map((bot) =>
        bot.id === botId ? { ...bot, status: "starting" as const } : bot
      )
    );
    setTimeout(() => {
      setBots((prev) =>
        prev.map((bot) =>
          bot.id === botId ? { ...bot, status: "online" as const } : bot
        )
      );
    }, 2000);
  };

  const handleViewLogs = (botId: string) => {
    const bot = bots.find((b) => b.id === botId);
    if (bot) {
      setSelectedBot(bot);
      setLogsDialogOpen(true);
    }
  };

  const handleSettings = (botId: string) => {
    console.log("Opening settings for bot:", botId);
  };

  const handleDelete = (botId: string) => {
    console.log("Deleting bot:", botId);
    setBots((prev) => prev.filter((bot) => bot.id !== botId));
  };

  const handleAddBot = (newBot: { name: string; token: string; description: string }) => {
    console.log("Adding new bot:", newBot);
    const bot: Bot = {
      id: String(Date.now()),
      name: newBot.name,
      status: "offline",
      uptime: "0m",
      memoryUsage: "0 MB",
    };
    setBots((prev) => [...prev, bot]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <BotIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">BotHost</h1>
          </div>
          <div className="flex items-center gap-2">
            <AddBotDialog onAddBot={handleAddBot} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Monitor and manage your Discord bots in real-time
            </p>
          </div>

          {bots.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Bots"
                  value={bots.length}
                  icon={BotIcon}
                  description={`${activeBots} active`}
                />
                <StatsCard
                  title="Active Bots"
                  value={activeBots}
                  icon={Activity}
                  description={`${bots.length - activeBots} offline`}
                />
                <StatsCard
                  title="Total Uptime"
                  value={totalUptime}
                  icon={Clock}
                  description="Combined uptime"
                />
                <StatsCard
                  title="Restarts Today"
                  value={3}
                  icon={Zap}
                  description="2 automatic"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Your Bots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bots.map((bot) => (
                    <BotCard
                      key={bot.id}
                      bot={bot}
                      onStart={handleStart}
                      onStop={handleStop}
                      onRestart={handleRestart}
                      onViewLogs={handleViewLogs}
                      onSettings={handleSettings}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <EmptyState onAddBot={() => setAddDialogOpen(true)} />
          )}
        </div>
      </main>

      {selectedBot && (
        <LogsDialog
          open={logsDialogOpen}
          onOpenChange={setLogsDialogOpen}
          botName={selectedBot.name}
          logs={mockLogs}
        />
      )}
    </div>
  );
}
