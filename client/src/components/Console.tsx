import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Play, RotateCw, Square, Skull, Copy, Download, Eraser, CheckCircle } from "lucide-react";

interface Log {
  timestamp: Date;
  level: string;
  message: string;
}

interface ConsoleProps {
  botId: string;
  botName: string;
  status: string;
  logs: Log[];
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onKill: () => void;
  isStarting?: boolean;
  isStopping?: boolean;
  isRestarting?: boolean;
}

export function Console({
  botId,
  botName,
  status,
  logs,
  onStart,
  onStop,
  onRestart,
  onKill,
  isStarting,
  isStopping,
  isRestarting,
}: ConsoleProps) {
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleLineSelection = (index: number) => {
    const newSelection = new Set(selectedLines);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedLines(newSelection);
  };

  const copySelected = () => {
    const selectedLogs = logs
      .filter((_, index) => selectedLines.has(index))
      .map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(selectedLogs);
  };

  const copyAll = () => {
    const allLogs = logs
      .map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(allLogs);
  };

  const downloadLogs = () => {
    const logsText = logs
      .map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${botName}-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearSelection = () => {
    setSelectedLines(new Set());
  };

  const isOffline = status === "offline" || status === "stopped";
  const isOnline = status === "online";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
          <Terminal className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-foreground dark:text-foreground">Console</h2>
        <p className="text-muted-foreground">Manage your server with ease.</p>
      </div>

      <Card className="p-6 bg-card dark:bg-card border-border dark:border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">🏷️</span>
            <span className="text-sm font-medium text-foreground dark:text-foreground">{botName}</span>
          </div>
          <Badge 
            variant={isOffline ? "secondary" : "default"}
            className={isOffline ? "bg-destructive/20 text-destructive dark:bg-destructive/20 dark:text-destructive" : "bg-green-500/20 text-green-700 dark:bg-green-500/20 dark:text-green-400"}
            data-testid="badge-status"
          >
            {isOffline ? "Offline" : "Online"}
          </Badge>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 bg-muted/50 dark:bg-muted/50"
            onClick={onStart}
            disabled={isOnline || isStarting}
            data-testid="button-console-play"
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 bg-muted/50 dark:bg-muted/50"
            onClick={onRestart}
            disabled={isOffline || isRestarting}
            data-testid="button-console-refresh"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 bg-muted/50 dark:bg-muted/50"
            onClick={onStop}
            disabled={isOffline || isStopping}
            data-testid="button-console-stop"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 bg-muted/50 dark:bg-muted/50 text-destructive dark:text-destructive"
            onClick={onKill}
            disabled={isOffline}
            data-testid="button-console-kill"
          >
            Kill
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-card dark:bg-card border-border dark:border-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-500/20 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground dark:text-foreground">Discord API Available</h3>
            <p className="text-sm text-muted-foreground">
              Your server is running smoothly with full Discord API access.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card dark:bg-card border-border dark:border-border">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={copySelected}
              disabled={selectedLines.size === 0}
              data-testid="button-copy-selected"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAll}
              disabled={logs.length === 0}
              data-testid="button-copy-all"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLogs}
              disabled={logs.length === 0}
              data-testid="button-download-logs"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selectedLines.size === 0}
              data-testid="button-clear-selection"
            >
              <Eraser className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <ScrollArea className="h-96 bg-black dark:bg-black rounded-lg border border-border dark:border-border">
            <div className="p-4 font-mono text-sm" ref={scrollRef}>
              {logs.length === 0 ? (
                <div className="text-green-400 dark:text-green-400">Server marked as offline</div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`py-1 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 ${
                      selectedLines.has(index) ? 'bg-primary/20 dark:bg-primary/20' : ''
                    }`}
                    onClick={() => toggleLineSelection(index)}
                    data-testid={`log-line-${index}`}
                  >
                    <span className="text-gray-500 dark:text-gray-500">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>{' '}
                    <span
                      className={
                        log.level === 'error'
                          ? 'text-red-400 dark:text-red-400'
                          : log.level === 'warn'
                          ? 'text-yellow-400 dark:text-yellow-400'
                          : 'text-green-400 dark:text-green-400'
                      }
                    >
                      {log.level.toUpperCase()}:
                    </span>{' '}
                    <span className="text-gray-300 dark:text-gray-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
