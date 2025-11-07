import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface RuntimeConfig {
  botId: string;
  cpuLimit: number;
  memoryLimit: number;
  diskLimit: number;
  alwaysOn: boolean;
}

export function RuntimeConfig({ botId }: { botId: string }) {
  const { toast } = useToast();
  const { data: config } = useQuery<RuntimeConfig>({
    queryKey: ["/api/bots", botId, "config"],
    enabled: !!botId,
  });

  const [cpuLimit, setCpuLimit] = useState(100);
  const [memoryLimit, setMemoryLimit] = useState(512);
  const [diskLimit, setDiskLimit] = useState(1024);
  const [alwaysOn, setAlwaysOn] = useState(false);

  useEffect(() => {
    if (config) {
      setCpuLimit(config.cpuLimit || 100);
      setMemoryLimit(config.memoryLimit || 512);
      setDiskLimit(config.diskLimit || 1024);
      setAlwaysOn(config.alwaysOn || false);
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/bots/${botId}/config`, {
        botId,
        cpuLimit,
        memoryLimit,
        diskLimit,
        alwaysOn,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "config"] });
      toast({ title: "Configuration updated" });
    },
    onError: () => {
      toast({ title: "Failed to update configuration", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cpu">CPU Limit (%)</Label>
            <Input
              id="cpu"
              type="number"
              value={cpuLimit}
              onChange={(e) => setCpuLimit(Number(e.target.value))}
              min={1}
              max={100}
            />
          </div>

          <div>
            <Label htmlFor="memory">Memory Limit (MB)</Label>
            <Input
              id="memory"
              type="number"
              value={memoryLimit}
              onChange={(e) => setMemoryLimit(Number(e.target.value))}
              min={128}
              max={2048}
            />
          </div>

          <div>
            <Label htmlFor="disk">Disk Limit (MB)</Label>
            <Input
              id="disk"
              type="number"
              value={diskLimit}
              onChange={(e) => setDiskLimit(Number(e.target.value))}
              min={512}
              max={10240}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="always-on"
              checked={alwaysOn}
              onCheckedChange={setAlwaysOn}
            />
            <Label htmlFor="always-on">24/7 Always On</Label>
          </div>

          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
