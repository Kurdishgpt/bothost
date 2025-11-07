import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, ArrowLeft } from "lucide-react";
import { SERVER_TYPES, getLanguageServerTypes, getDatabaseServerTypes } from "@shared/serverTypes";
import type { ServerTypeDefinition } from "@shared/serverTypes";
import * as SiIcons from "react-icons/si";

interface AddServerDialogProps {
  onAddServer?: (server: {
    name: string;
    serverType: string;
    category: string;
    description: string;
    entryFile: string;
    startupCommand: string;
    gitRepoUrl?: string;
    gitBranch: string;
    gitUsername?: string;
    gitAccessToken?: string;
    autoUpdate: boolean;
  }) => void;
}

export function AddServerDialog({ onAddServer }: AddServerDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select-type" | "configure">("select-type");
  const [selectedType, setSelectedType] = useState<ServerTypeDefinition | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gitRepoUrl: "",
    gitBranch: "main",
    gitUsername: "",
    gitAccessToken: "",
    autoUpdate: false,
  });

  const handleTypeSelect = (type: ServerTypeDefinition) => {
    setSelectedType(type);
    setFormData((prev) => ({
      ...prev,
      gitBranch: type.defaultGitBranch,
    }));
    setStep("configure");
  };

  const handleBack = () => {
    setStep("select-type");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    onAddServer?.({
      ...formData,
      serverType: selectedType.id,
      category: selectedType.category,
      entryFile: selectedType.defaultEntryFile,
      startupCommand: selectedType.defaultStartupCommand,
    });

    // Reset form
    setFormData({
      name: "",
      description: "",
      gitRepoUrl: "",
      gitBranch: "main",
      gitUsername: "",
      gitAccessToken: "",
      autoUpdate: false,
    });
    setSelectedType(null);
    setStep("select-type");
    setOpen(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderServerTypeCard = (type: ServerTypeDefinition) => {
    const IconComponent = SiIcons[type.icon as keyof typeof SiIcons] as React.ComponentType<{ className?: string }>;

    return (
      <button
        key={type.id}
        type="button"
        onClick={() => handleTypeSelect(type)}
        className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-accent hover:border-primary transition-all text-left"
        data-testid={`card-server-type-${type.id}`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {IconComponent && <IconComponent className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">{type.name}</h4>
          <p className="text-xs text-muted-foreground">{type.description}</p>
        </div>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-server">
          <Plus className="w-4 h-4" />
          Create Server
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" data-testid="dialog-add-server">
        {step === "select-type" ? (
          <>
            <DialogHeader>
              <DialogTitle>Choose Server Type</DialogTitle>
              <DialogDescription>
                Select the type of server you want to create
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold mb-3">Programming Languages</h3>
                <div className="grid grid-cols-2 gap-3">
                  {getLanguageServerTypes().map(renderServerTypeCard)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Databases</h3>
                <div className="grid grid-cols-2 gap-3">
                  {getDatabaseServerTypes().map(renderServerTypeCard)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <DialogTitle>Configure Server Settings</DialogTitle>
                  <DialogDescription>
                    Configure your {selectedType?.name} server environment and settings
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="server-name">Server Name</Label>
                <Input
                  id="server-name"
                  placeholder="My Production Server"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  data-testid="input-server-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="git-repo-url">Git Repo Address</Label>
                <Input
                  id="git-repo-url"
                  type="url"
                  placeholder="https://github.com/username/repository.git"
                  value={formData.gitRepoUrl}
                  onChange={(e) => handleChange("gitRepoUrl", e.target.value)}
                  data-testid="input-git-repo-url"
                />
                <p className="text-xs text-muted-foreground">
                  The branch to clone from (e.g., main, master, develop)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="git-branch">Install Branch</Label>
                <Input
                  id="git-branch"
                  placeholder="main"
                  value={formData.gitBranch}
                  onChange={(e) => handleChange("gitBranch", e.target.value)}
                  data-testid="input-git-branch"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-update">Auto Update</Label>
                  <p className="text-xs text-muted-foreground">
                    Pull the latest files when a GitHub repo updates (e.g., new commit or push)
                  </p>
                </div>
                <Switch
                  id="auto-update"
                  checked={formData.autoUpdate}
                  onCheckedChange={(checked) => handleChange("autoUpdate", checked)}
                  data-testid="switch-auto-update"
                />
              </div>

              {selectedType?.category === "language" && (
                <div className="space-y-2">
                  <Label htmlFor="entry-file">{selectedType.id === "nodejs" || selectedType.id === "bun" ? "JS" : selectedType.name} File</Label>
                  <Input
                    id="entry-file"
                    placeholder={selectedType.defaultEntryFile}
                    value={selectedType.defaultEntryFile}
                    disabled
                    data-testid="input-entry-file"
                  />
                  <p className="text-xs text-muted-foreground">
                    The file that starts the app
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="git-username">Git Username</Label>
                <Input
                  id="git-username"
                  placeholder="Username to push with git"
                  value={formData.gitUsername}
                  onChange={(e) => handleChange("gitUsername", e.target.value)}
                  data-testid="input-git-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="git-access-token">Git Access Token</Label>
                <Input
                  id="git-access-token"
                  type="password"
                  placeholder="Password to use with git. It need permission to use git to host product to github:  https://github.com/settings/tokens"
                  value={formData.gitAccessToken}
                  onChange={(e) => handleChange("gitAccessToken", e.target.value)}
                  className="font-mono text-xs"
                  data-testid="input-git-access-token"
                />
                <p className="text-xs text-muted-foreground">
                  Personal Access Token from{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub settings
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-description">Description (Optional)</Label>
                <Textarea
                  id="server-description"
                  placeholder="A brief description of this server..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  data-testid="input-server-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" data-testid="button-submit">
                Create Server
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
