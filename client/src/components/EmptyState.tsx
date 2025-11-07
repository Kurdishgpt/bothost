import { Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddBot?: () => void;
}

export function EmptyState({ onAddBot }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid="empty-state">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bot className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No bots yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Get started by adding your first Discord bot. You'll need your bot token from the Discord Developer Portal.
      </p>
      <Button onClick={onAddBot} data-testid="button-add-first-bot">
        <Plus className="w-4 h-4" />
        Add Your First Bot
      </Button>
    </div>
  );
}
