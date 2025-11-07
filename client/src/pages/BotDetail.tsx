import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { FileManager } from "@/components/FileManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ArrowLeft, Play, Square, RotateCw } from "lucide-react";
import type { BotStatus } from "@/components/StatusIndicator";

export default function BotDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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
  const isRunning = status === "online" || status === "starting";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
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
              <h1 className="text-xl font-semibold">{bot?.name}</h1>
              <StatusIndicator status={status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => stopMutation.mutate()}
                  disabled={stopMutation.isPending || status === "starting"}
                  data-testid="button-stop"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restartMutation.mutate()}
                  disabled={restartMutation.isPending || status === "starting"}
                  data-testid="button-restart"
                >
                  <RotateCw className="w-4 h-4" />
                  Restart
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                data-testid="button-start"
              >
                <Play className="w-4 h-4" />
                Start
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">
              {bot?.description || "No description provided."}
            </p>
          </div>

          <FileManager
            botId={id!}
            files={files}
            onCreateFile={(file) => createFileMutation.mutate(file)}
            onUpdateFile={(fileId, content) => updateFileMutation.mutate({ fileId, content })}
            onDeleteFile={(fileId) => deleteFileMutation.mutate(fileId)}
          />
        </div>
      </main>
    </div>
  );
}
