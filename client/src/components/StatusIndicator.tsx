import { cn } from "@/lib/utils";

export type BotStatus = "online" | "offline" | "starting" | "error";

interface StatusIndicatorProps {
  status: BotStatus;
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({ status, showLabel = true, className }: StatusIndicatorProps) {
  const statusConfig = {
    online: {
      label: "Online",
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-400",
      animate: true,
    },
    offline: {
      label: "Offline",
      color: "bg-gray-400 dark:bg-gray-500",
      textColor: "text-muted-foreground",
      animate: false,
    },
    starting: {
      label: "Starting",
      color: "bg-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-400",
      animate: true,
    },
    error: {
      label: "Error",
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      animate: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className={cn("w-2 h-2 rounded-full", config.color)} />
        {config.animate && (
          <div className={cn("absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75", config.color)} />
        )}
      </div>
      {showLabel && (
        <span className={cn("text-sm font-medium", config.textColor)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
