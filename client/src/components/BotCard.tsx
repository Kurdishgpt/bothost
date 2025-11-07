import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIndicator, type BotStatus } from "./StatusIndicator";
import { Play, Square, RotateCw, Settings, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Bot {
  id: string;
  name: string;
  status: BotStatus;
  uptime: string;
  lastRestart?: string;
  memoryUsage?: string;
}

interface BotCardProps {
  bot: Bot;
  onStart?: (botId: string) => void;
  onStop?: (botId: string) => void;
  onRestart?: (botId: string) => void;
  onViewLogs?: (botId: string) => void;
  onSettings?: (botId: string) => void;
  onDelete?: (botId: string) => void;
}

export function BotCard({
  bot,
  onStart,
  onStop,
  onRestart,
  onViewLogs,
  onSettings,
  onDelete,
}: BotCardProps) {
  const isRunning = bot.status === "online" || bot.status === "starting";

  return (
    <Card className="hover-elevate" data-testid={`card-bot-${bot.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate" data-testid={`text-bot-name-${bot.id}`}>
            {bot.name}
          </h3>
        </div>
        <StatusIndicator status={bot.status} showLabel={false} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <StatusIndicator status={bot.status} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uptime</span>
            <span className="font-medium font-mono text-xs" data-testid={`text-uptime-${bot.id}`}>
              {bot.uptime}
            </span>
          </div>
          {bot.memoryUsage && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Memory</span>
              <span className="font-medium font-mono text-xs" data-testid={`text-memory-${bot.id}`}>
                {bot.memoryUsage}
              </span>
            </div>
          )}
          {bot.lastRestart && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Restart</span>
              <span className="text-xs text-muted-foreground" data-testid={`text-last-restart-${bot.id}`}>
                {bot.lastRestart}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {isRunning ? (
            <>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onStop?.(bot.id)}
                disabled={bot.status === "starting"}
                data-testid={`button-stop-${bot.id}`}
              >
                <Square className="w-3 h-3" />
                Stop
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRestart?.(bot.id)}
                disabled={bot.status === "starting"}
                data-testid={`button-restart-${bot.id}`}
              >
                <RotateCw className="w-3 h-3" />
                Restart
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => onStart?.(bot.id)}
              data-testid={`button-start-${bot.id}`}
            >
              <Play className="w-3 h-3" />
              Start
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewLogs?.(bot.id)}
            data-testid={`button-logs-${bot.id}`}
          >
            <FileText className="w-3 h-3" />
            Logs
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSettings?.(bot.id)}
            data-testid={`button-settings-${bot.id}`}
          >
            <Settings className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete?.(bot.id)}
            data-testid={`button-delete-${bot.id}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
