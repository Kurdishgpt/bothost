import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Download } from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

interface LogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botName: string;
  logs: LogEntry[];
}

export function LogsDialog({ open, onOpenChange, botName, logs }: LogsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-500";
      case "warn":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[600px] flex flex-col" data-testid="dialog-logs">
        <DialogHeader>
          <DialogTitle>Bot Logs - {botName}</DialogTitle>
          <DialogDescription>
            View real-time logs and activity from your bot.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-logs"
            />
          </div>
          <Button variant="outline" size="icon" data-testid="button-download-logs">
            <Download className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 rounded-md border bg-muted/30">
          <div className="p-4 font-mono text-xs space-y-1">
            {filteredLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No logs found</p>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className="flex gap-2" data-testid={`log-entry-${index}`}>
                  <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                  <span className={`shrink-0 font-semibold ${getLevelColor(log.level)}`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="text-foreground break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
