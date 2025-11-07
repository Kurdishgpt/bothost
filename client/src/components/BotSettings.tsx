import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Bot {
  id: string;
  name: string;
  entryPoint: string;
  startupCommand: string | null;
}

export function BotSettings({ botId }: { botId: string }) {
  const { toast } = useToast();
  const { data: bot } = useQuery<Bot>({
    queryKey: ["/api/bots", botId],
    enabled: !!botId,
  });

  const [entryPoint, setEntryPoint] = useState("index.js");
  const [startupCommand, setStartupCommand] = useState("");

  useEffect(() => {
    if (bot) {
      setEntryPoint(bot.entryPoint || "index.js");
      setStartupCommand(bot.startupCommand || "");
    }
  }, [bot]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/bots/${botId}`, {
        entryPoint,
        startupCommand: startupCommand || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId] });
      toast({ title: "Bot settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update bot settings", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Settings</CardTitle>
        <CardDescription>
          Configure startup parameters and entry point for your bot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entry-point">Entry Point</Label>
            <Input
              id="entry-point"
              value={entryPoint}
              onChange={(e) => setEntryPoint(e.target.value)}
              placeholder="index.js"
              data-testid="input-entry-point"
            />
            <p className="text-xs text-muted-foreground">
              The main file to run when starting your bot
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startup-command">Startup Command</Label>
            <Input
              id="startup-command"
              value={startupCommand}
              onChange={(e) => setStartupCommand(e.target.value)}
              placeholder="e.g., --debug --shard-count 2"
              data-testid="input-startup-command-edit"
            />
            <p className="text-xs text-muted-foreground">
              Custom arguments or flags to pass when starting your bot
            </p>
          </div>

          <Button 
            onClick={() => updateMutation.mutate()} 
            disabled={updateMutation.isPending}
            data-testid="button-save-bot-settings"
          >
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
