import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github } from "lucide-react";

export function GitHubIntegration({ botId }: { botId: string }) {
  const [repos, setRepos] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
          <Github className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-foreground dark:text-foreground">GitHub Integration</h2>
        <p className="text-muted-foreground">Connect and manage your GitHub repositories.</p>
      </div>

      <Card className="p-6 bg-card dark:bg-card border-border dark:border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
            <Github className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground dark:text-foreground">Repository Management</h3>
          </div>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground mb-6"
          data-testid="button-connect-repository"
        >
          <Github className="w-4 h-4 mr-2" />
          Connect Repository
        </Button>

        <div className="border-t border-border dark:border-border pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-muted/50 dark:bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Github className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground dark:text-foreground">No Repositories Connected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Connect your first GitHub repository to start syncing your bot code automatically.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
