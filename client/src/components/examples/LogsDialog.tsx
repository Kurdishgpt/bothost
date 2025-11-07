import { useState } from "react";
import { LogsDialog } from "../LogsDialog";
import { Button } from "@/components/ui/button";

export default function LogsDialogExample() {
  const [open, setOpen] = useState(false);

  const mockLogs = [
    { timestamp: "2024-01-15 14:23:45", level: "info" as const, message: "Bot started successfully" },
    { timestamp: "2024-01-15 14:23:46", level: "info" as const, message: "Connected to Discord gateway" },
    { timestamp: "2024-01-15 14:23:47", level: "info" as const, message: "Logged in as MusicBot#1234" },
    { timestamp: "2024-01-15 14:24:12", level: "warn" as const, message: "High memory usage detected: 256MB" },
    { timestamp: "2024-01-15 14:25:33", level: "info" as const, message: "Command received: /play" },
    { timestamp: "2024-01-15 14:26:01", level: "error" as const, message: "Failed to connect to voice channel: Permission denied" },
    { timestamp: "2024-01-15 14:27:15", level: "info" as const, message: "User joined voice channel" },
  ];

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Logs</Button>
      <LogsDialog
        open={open}
        onOpenChange={setOpen}
        botName="Music Bot"
        logs={mockLogs}
      />
    </div>
  );
}
