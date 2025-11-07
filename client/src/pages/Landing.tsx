import { Button } from "@/components/ui/button";
import { Bot, Shield, Zap, Code } from "lucide-react";

export default function Landing() {
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
          <Button onClick={() => (window.location.href = "/api/login")} data-testid="button-login">
            Log In
          </Button>
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
              <Button
                size="lg"
                onClick={() => (window.location.href = "/api/login")}
                data-testid="button-get-started"
              >
                Get Started Free
              </Button>
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
