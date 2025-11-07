import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Console } from "@/components/Console";
import { EnhancedFileManager } from "@/components/EnhancedFileManager";
import { GitHubIntegration } from "@/components/GitHubIntegration";
import { EnhancedPackageManager } from "@/components/EnhancedPackageManager";
import { EnvVarsManager } from "@/components/EnvVarsManager";
import { RuntimeConfig } from "@/components/RuntimeConfig";
import { ResourceMetrics } from "@/components/ResourceMetrics";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ArrowLeft } from "lucide-react";
import type { BotStatus } from "@/components/StatusIndicator";

export default function BotDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("console");

  // Redirect if not authenticated - referenced from blueprint:javascript_log_in_with_replit
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: bot } = useQuery<any>({
    queryKey: ["/api/bots", id],
    enabled: !!id,
  });

  const { data: files = [] } = useQuery<any[]>({
    queryKey: ["/api/bots", id, "files"],
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "log" && data.data?.botId === id && data.data?.log) {
        setLogs(prev => [...prev, data.data.log].slice(-100));
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [id]);

  const startMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/bots/${id}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", id] });
      toast({ title: "Bot is starting..." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Failed to start bot", variant: "destructive" });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/bots/${id}/stop`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", id] });
      toast({ title: "Bot stopped" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Failed to stop bot", variant: "destructive" });
    },
  });

  const restartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/bots/${id}/restart`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", id] });
      toast({ title: "Bot is restarting..." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Failed to restart bot", variant: "destructive" });
    },
  });

  const killMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/bots/${id}/stop`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", id] });
      toast({ title: "Bot killed" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Failed to kill bot", variant: "destructive" });
    },
  });

  const createFileMutation = useMutation({
    mutationFn: async (file: { filename: string; path: string; content: string; size: string }) => {
      await apiRequest("POST", `/api/bots/${id}/files`, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", id, "files"] });
      toast({ title: "File created successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Failed to create file", variant: "destructive" });
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: string; content: string }) => {
      await apiRequest("PATCH", `/api/files/${fileId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", id, "files"] });
      toast({ title: "File updated successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Failed to update file", variant: "destructive" });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest("DELETE", `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots", id, "files"] });
      toast({ title: "File deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Failed to delete file", variant: "destructive" });
    },
  });

  const status = (bot?.runtimeStatus || bot?.status || "offline") as BotStatus;

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <header className="border-b sticky top-0 bg-background dark:bg-background z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground dark:text-foreground">{bot?.name}</h1>
              <StatusIndicator status={status} />
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex mb-8">
            <TabsTrigger value="console" data-testid="tab-console">Console</TabsTrigger>
            <TabsTrigger value="files" data-testid="tab-files">Files</TabsTrigger>
            <TabsTrigger value="github" data-testid="tab-github">GitHub</TabsTrigger>
            <TabsTrigger value="packages" data-testid="tab-packages">Packages</TabsTrigger>
            <TabsTrigger value="env" data-testid="tab-env">Env Vars</TabsTrigger>
            <TabsTrigger value="config" data-testid="tab-config">Config</TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="console" data-testid="content-console">
            <Console
              botId={id!}
              botName={bot?.name || "Bot"}
              status={status}
              logs={logs}
              onStart={() => startMutation.mutate()}
              onStop={() => stopMutation.mutate()}
              onRestart={() => restartMutation.mutate()}
              onKill={() => killMutation.mutate()}
              isStarting={startMutation.isPending}
              isStopping={stopMutation.isPending}
              isRestarting={restartMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="files" data-testid="content-files">
            <EnhancedFileManager
              botId={id!}
              files={files}
              onCreateFile={(file) => createFileMutation.mutate(file)}
              onUpdateFile={(fileId, content) => updateFileMutation.mutate({ fileId, content })}
              onDeleteFile={(fileId) => deleteFileMutation.mutate(fileId)}
            />
          </TabsContent>

          <TabsContent value="github" data-testid="content-github">
            <GitHubIntegration botId={id!} />
          </TabsContent>

          <TabsContent value="packages" data-testid="content-packages">
            <EnhancedPackageManager botId={id!} />
          </TabsContent>

          <TabsContent value="env" data-testid="content-env">
            <EnvVarsManager botId={id!} />
          </TabsContent>

          <TabsContent value="config" data-testid="content-config">
            <RuntimeConfig botId={id!} />
          </TabsContent>

          <TabsContent value="metrics" data-testid="content-metrics">
            <ResourceMetrics botId={id!} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
