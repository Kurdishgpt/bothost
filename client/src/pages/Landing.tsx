import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bot, Shield, Zap, Code } from "lucide-react";

export default function Landing() {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">BotHost</h1>
          </div>
          <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-login">Log In</Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-login">
              <DialogHeader>
                <DialogTitle>Log In to BotHost</DialogTitle>
                <DialogDescription>
                  Enter your credentials to access your dashboard
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin1234"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="admin1234"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    data-testid="input-password"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleLogin}
                  disabled={isLoggingIn || !username || !password}
                  data-testid="button-submit-login"
                >
                  {isLoggingIn ? "Logging in..." : "Log In"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Or{" "}
                  <button
                    onClick={() => (window.location.href = "/api/login")}
                    className="text-primary hover:underline"
                    data-testid="link-replit-auth"
                  >
                    log in with Replit
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="py-20 md:py-32 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Host Your Discord Bots
              <span className="block text-primary mt-2">Anywhere, Anytime</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your bot files, configure your Discord token, and keep your bots running 24/7 with real-time monitoring and automatic restarts.
            </p>
            <div className="pt-4">
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-get-started">
                    Get Started Free
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pb-20">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">File Manager</h3>
            <p className="text-muted-foreground">
              Upload and edit your bot files directly in the browser with our built-in code editor.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Real-Time Monitoring</h3>
            <p className="text-muted-foreground">
              Track your bot's status, uptime, and logs in real-time with instant updates.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Secure Hosting</h3>
            <p className="text-muted-foreground">
              Your bot tokens are encrypted and your bots run in isolated environments.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
