import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface EnvVar {
  id: string;
  botId: string;
  key: string;
  createdAt: Date;
}

export function EnvVarsManager({ botId }: { botId: string }) {
  const { toast } = useToast();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const { data: envVars = [] } = useQuery<EnvVar[]>({
    queryKey: ["/api/bots", botId, "env"],
    enabled: !!botId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/bots/${botId}/env`, {
        key: newKey,
        value: newValue,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "env"] });
      setNewKey("");
      setNewValue("");
      toast({ title: "Environment variable added" });
    },
    onError: () => {
      toast({ title: "Failed to add variable", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (envId: string) => {
      await apiRequest("DELETE", `/api/env/${envId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "env"] });
      toast({ title: "Environment variable deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete variable", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newKey || !newValue || createMutation.isPending}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {envVars.map((envVar) => (
              <div key={envVar.id} className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono">{envVar.key}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(envVar.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
