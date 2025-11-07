// Dashboard with real authentication and data - referenced from blueprint:javascript_log_in_with_replit
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { BotCard, type Bot } from "@/components/BotCard";
import { StatsCard } from "@/components/StatsCard";
import { AddServerDialog } from "@/components/AddServerDialog";
import { EmptyState } from "@/components/EmptyState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Server as ServerIcon, Activity, Clock, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {  Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BotStatus } from "@/components/StatusIndicator";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: servers = [] } = useQuery<Bot[]>({
    queryKey: ["/api/servers"],
    enabled: isAuthenticated,
  });

  const addServerMutation = useMutation({
    mutationFn: async (newServer: any) => {
      await apiRequest("POST", "/api/servers", newServer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({ title: "Server created successfully" });
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
      toast({ title: "Failed to create server", variant: "destructive" });
    },
  });

  const startMutation = useMutation({
    mutationFn: async (serverId: string) => {
      await apiRequest("POST", `/api/servers/${serverId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({ title: "Server is starting..." });
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
      toast({ title: "Failed to start server", variant: "destructive" });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async (serverId: string) => {
      await apiRequest("POST", `/api/servers/${serverId}/stop`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({ title: "Server stopped" });
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
      toast({ title: "Failed to stop server", variant: "destructive" });
    },
  });

  const restartMutation = useMutation({
    mutationFn: async (serverId: string) => {
      await apiRequest("POST", `/api/servers/${serverId}/restart`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({ title: "Server is restarting..." });
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
      toast({ title: "Failed to restart server", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (serverId: string) => {
      await apiRequest("DELETE", `/api/servers/${serverId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({ title: "Server deleted successfully" });
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
      toast({ title: "Failed to delete server", variant: "destructive" });
    },
  });

  const activeServers = servers.filter((server: any) => server.runtimeStatus === "online" || server.status === "online").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <ServerIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">ServerHost</h1>
          </div>
          <div className="flex items-center gap-2">
            <AddServerDialog onAddServer={(server) => addServerMutation.mutate(server)} />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.email || ""} className="object-cover" />
                    <AvatarFallback>{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => (window.location.href = "/api/logout")} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Monitor and manage your servers in real-time
            </p>
          </div>

          {servers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Servers"
                  value={servers.length}
                  icon={ServerIcon}
                  description={`${activeServers} active`}
                />
                <StatsCard
                  title="Active Servers"
                  value={activeServers}
                  icon={Activity}
                  description={`${servers.length - activeServers} offline`}
                />
                <StatsCard
                  title="Total Uptime"
                  value="--"
                  icon={Clock}
                  description="Combined uptime"
                />
                <StatsCard
                  title="Restarts Today"
                  value="--"
                  icon={Zap}
                  description="Automatic restarts"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Your Servers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servers.map((server: any) => (
                    <BotCard
                      key={server.id}
                      bot={{
                        id: server.id,
                        name: server.name,
                        status: (server.runtimeStatus || server.status) as BotStatus,
                        uptime: server.uptime ? `${Math.floor(server.uptime / 1000 / 60)}m` : "0m",
                        memoryUsage: "-- MB",
                        lastRestart: server.updatedAt ? new Date(server.updatedAt).toLocaleDateString() : "--",
                      }}
                      onStart={(id) => startMutation.mutate(id)}
                      onStop={(id) => stopMutation.mutate(id)}
                      onRestart={(id) => restartMutation.mutate(id)}
                      onViewLogs={(id) => setLocation(`/servers/${id}`)}
                      onSettings={(id) => setLocation(`/servers/${id}`)}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <EmptyState onAddBot={() => {}} />
          )}
        </div>
      </main>
    </div>
  );
}
