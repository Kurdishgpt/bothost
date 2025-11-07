import { BotCard } from "../BotCard";

export default function BotCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <BotCard
        bot={{
          id: "1",
          name: "Music Bot",
          status: "online",
          uptime: "2d 5h 32m",
          memoryUsage: "128 MB",
          lastRestart: "2 days ago",
        }}
        onStart={(id) => console.log("Start bot", id)}
        onStop={(id) => console.log("Stop bot", id)}
        onRestart={(id) => console.log("Restart bot", id)}
        onViewLogs={(id) => console.log("View logs", id)}
        onSettings={(id) => console.log("Settings", id)}
        onDelete={(id) => console.log("Delete bot", id)}
      />
    </div>
  );
}
