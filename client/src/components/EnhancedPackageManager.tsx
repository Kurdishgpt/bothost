import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Package } from "lucide-react";

interface BotPackage {
  id: string;
  botId: string;
  name: string;
  version: string;
  source: string;
  installedAt: Date;
}

export function EnhancedPackageManager({ botId }: { botId: string }) {
  const { toast } = useToast();
  const [packageInput, setPackageInput] = useState("");
  const [packages, setPackages] = useState<string[]>([]);

  const { data: installedPackages = [] } = useQuery<BotPackage[]>({
    queryKey: ["/api/bots", botId, "packages"],
    enabled: !!botId,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const pkgNames = packageInput.split(',').map(p => p.trim()).filter(Boolean);
      for (const name of pkgNames) {
        await apiRequest("POST", `/api/bots/${botId}/packages`, {
          name,
          version: "latest",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "packages"] });
      setPackageInput("");
      toast({ title: "Packages added" });
    },
    onError: () => {
      toast({ title: "Failed to add packages", variant: "destructive" });
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

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      for (const pkg of installedPackages) {
        await apiRequest("DELETE", `/api/packages/${pkg.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "packages"] });
      toast({ title: "All packages cleared" });
    },
    onError: () => {
      toast({ title: "Failed to clear packages", variant: "destructive" });
    },
  });

  const handleAddPackage = () => {
    if (packageInput.trim()) {
      addMutation.mutate();
    }
  };

  const handleSavePackages = () => {
    toast({ title: "Packages saved successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 bg-orange-500/20 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
          <Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-foreground dark:text-foreground">Additional Node.js Packages</h2>
        <p className="text-muted-foreground">Add packages to be automatically installed with your server</p>
      </div>

      <Card className="p-6 bg-card dark:bg-card border-border dark:border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-foreground dark:text-foreground">Package Manager</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground dark:text-foreground">{installedPackages.length}</div>
            <div className="text-sm text-muted-foreground">packages</div>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="e.g., express, discord.js, axios"
            value={packageInput}
            onChange={(e) => setPackageInput(e.target.value)}
            className="bg-muted/50 dark:bg-muted/50 border-border dark:border-border"
            data-testid="input-package-name"
          />

          <Button 
            onClick={handleAddPackage}
            disabled={!packageInput.trim() || addMutation.isPending}
            className="w-full bg-muted hover:bg-muted/80 text-foreground dark:bg-muted dark:hover:bg-muted/80 dark:text-foreground"
            variant="outline"
            data-testid="button-add-package"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Package
          </Button>
        </div>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4 text-foreground dark:text-foreground">Installed Packages</h3>
        
        {installedPackages.length > 0 ? (
          <div className="space-y-2 mb-4">
            {installedPackages.map((pkg) => (
              <Card key={pkg.id} className="p-4 bg-card dark:bg-card border-border dark:border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-medium text-foreground dark:text-foreground">{pkg.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">@{pkg.version}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(pkg.id)}
                    data-testid={`button-delete-package-${pkg.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 bg-card dark:bg-card border-border dark:border-border mb-4">
            <p className="text-center text-muted-foreground">No packages installed yet.</p>
          </Card>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => clearAllMutation.mutate()}
            disabled={installedPackages.length === 0 || clearAllMutation.isPending}
            data-testid="button-clear-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 dark:text-white"
            onClick={handleSavePackages}
            data-testid="button-save-packages"
          >
            <Package className="w-4 h-4 mr-2" />
            Save Packages
          </Button>
        </div>
      </div>
    </div>
  );
}
