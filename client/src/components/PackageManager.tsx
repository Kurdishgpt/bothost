import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Package } from "lucide-react";

interface BotPackage {
  id: string;
  botId: string;
  name: string;
  version: string;
  source: string;
  installedAt: Date;
}

export function PackageManager({ botId }: { botId: string }) {
  const { toast } = useToast();
  const [packageName, setPackageName] = useState("");
  const [packageVersion, setPackageVersion] = useState("latest");

  const { data: packages = [] } = useQuery<BotPackage[]>({
    queryKey: ["/api/bots", botId, "packages"],
    enabled: !!botId,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/bots/${botId}/packages`, {
        name: packageName,
        version: packageVersion,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "packages"] });
      setPackageName("");
      setPackageVersion("latest");
      toast({ title: "Package added" });
    },
    onError: () => {
      toast({ title: "Failed to add package", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (packageId: string) => {
      await apiRequest("DELETE", `/api/packages/${packageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "packages"] });
      toast({ title: "Package removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove package", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          NPM Packages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Package name (e.g., express)"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
            />
            <Input
              placeholder="Version"
              value={packageVersion}
              onChange={(e) => setPackageVersion(e.target.value)}
              className="w-32"
            />
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!packageName || addMutation.isPending}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-mono font-medium">{pkg.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">@{pkg.version}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(pkg.id)}
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
