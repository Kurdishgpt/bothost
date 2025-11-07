
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, FolderGit2, GitBranch, Download, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  path: string;
  lastSync: string;
  status: "connected" | "syncing" | "error";
}

export function GitHubIntegration({ botId }: { botId: string }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [targetPath, setTargetPath] = useState("/");
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // Mock data - replace with actual API call
  const [repos, setRepos] = useState<Repository[]>([
    {
      id: "1",
      name: "Kurdishgpt/Hi",
      url: "https://github.com/Kurdishgpt/Hi",
      branch: "main",
      path: "/",
      lastSync: "Never",
      status: "connected",
    },
  ]);

  const handleConnect = () => {
    // Add validation
    if (!repoUrl) {
      toast({
        title: "Error",
        description: "Repository URL is required",
        variant: "destructive",
      });
      return;
    }

    // Extract repo name from URL
    const repoName = repoUrl.split("/").slice(-2).join("/");

    const newRepo: Repository = {
      id: Date.now().toString(),
      name: repoName,
      url: repoUrl,
      branch,
      path: targetPath,
      lastSync: "Never",
      status: "connected",
    };

    setRepos([...repos, newRepo]);
    setDialogOpen(false);
    
    // Reset form
    setRepoUrl("");
    setBranch("main");
    setTargetPath("/");
    setUsername("");
    setAccessToken("");

    toast({
      title: "Repository Connected",
      description: `Successfully connected ${repoName}`,
    });
  };

  const handleClone = async (repo: Repository) => {
    try {
      toast({
        title: "Cloning Repository",
        description: `Cloning all files from ${repo.name}...`,
      });

      // Simulate fetching files from GitHub
      // In a real implementation, this would call the GitHub API
      const mockFiles = [
        { path: "index.js", content: "// Main bot file\nconsole.log('Bot started');" },
        { path: "config.json", content: '{\n  "prefix": "!",\n  "token": "your-token"\n}' },
        { path: "commands/help.js", content: "// Help command\nmodule.exports = { name: 'help' };" },
        { path: "README.md", content: "# Bot Project\n\nCloned from GitHub" },
      ];

      // Create files in the bot's file manager
      let successCount = 0;
      for (const file of mockFiles) {
        try {
          const size = new Blob([file.content]).size;
          await apiRequest(`/api/bots/${botId}/files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.path.split('/').pop(),
              path: repo.path + (file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : ''),
              content: file.content,
              size: `${(size / 1024).toFixed(2)} KB`,
            }),
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to create file ${file.path}:`, error);
        }
      }

      // Update last sync time
      const updatedRepos = repos.map(r => 
        r.id === repo.id 
          ? { ...r, lastSync: new Date().toLocaleString() }
          : r
      );
      setRepos(updatedRepos);

      toast({
        title: "Clone Complete",
        description: `Successfully cloned ${successCount} file(s) from ${repo.name}`,
      });

      // Refresh the page to show new files
      queryClient.invalidateQueries({ queryKey: [`/api/bots/${botId}/files`] });
    } catch (error: any) {
      toast({
        title: "Clone Failed",
        description: error.message || "Failed to clone repository files",
        variant: "destructive",
      });
    }
  };

  const handlePull = (repo: Repository) => {
    toast({
      title: "Pulling Changes",
      description: `Pulling latest changes from ${repo.name}...`,
    });
  };

  const handleDelete = (repoId: string) => {
    setRepos(repos.filter(r => r.id !== repoId));
    toast({
      title: "Repository Disconnected",
      description: "Repository has been removed",
    });
  };

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
          onClick={() => setDialogOpen(true)}
          data-testid="button-connect-repository"
        >
          <Github className="w-4 h-4 mr-2" />
          Connect Repository
        </Button>

        <div className="border-t border-border dark:border-border pt-6">
          {repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-muted/50 dark:bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Github className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground dark:text-foreground">No Repositories Connected</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Connect your first GitHub repository to start syncing your bot code automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {repos.map((repo) => (
                <Card key={repo.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Github className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold">{repo.name}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                        {repo.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{repo.branch}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FolderGit2 className="w-4 h-4" />
                        <span>{repo.path}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-yellow-600 dark:text-yellow-400">⏱️</span>
                        <span>Last sync: {repo.lastSync}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClone(repo)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Clone
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePull(repo)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Pull
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(repo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect Repository</DialogTitle>
            <DialogDescription>
              Connect your GitHub repository to sync bot files
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger id="branch">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="master">master</SelectItem>
                  <SelectItem value="develop">develop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-path">Target Path (optional)</Label>
              <Input
                id="target-path"
                placeholder="/"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">GitHub Username (optional)</Label>
              <Input
                id="username"
                placeholder="your-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1">
                <span>ℹ️</span>
                <span>Required for private repositories</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Personal Access Token (optional)</Label>
              <Input
                id="token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1">
                <span>🔑</span>
                <span>Required for private repositories. Generate token</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect}>
              <Github className="w-4 h-4 mr-2" />
              Connect Repository
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
