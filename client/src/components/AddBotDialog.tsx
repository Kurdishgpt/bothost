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
import { Plus, Eye, EyeOff } from "lucide-react";

interface AddBotDialogProps {
  onAddBot?: (bot: { name: string; token: string; description: string }) => void;
}

export function AddBotDialog({ onAddBot }: AddBotDialogProps) {
  const [open, setOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    token: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBot?.(formData);
    setFormData({ name: "", token: "", description: "" });
    setOpen(false);
    setShowToken(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-bot">
          <Plus className="w-4 h-4" />
          Add Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="dialog-add-bot">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Bot</DialogTitle>
            <DialogDescription>
              Add your Discord bot token to host and monitor it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bot-name">Bot Name</Label>
              <Input
                id="bot-name"
                placeholder="My Awesome Bot"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                data-testid="input-bot-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bot-token">Discord Bot Token</Label>
              <div className="relative">
                <Input
                  id="bot-token"
                  type={showToken ? "text" : "password"}
                  placeholder="MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs"
                  value={formData.token}
                  onChange={(e) => handleChange("token", e.target.value)}
                  className="font-mono text-xs pr-10"
                  required
                  data-testid="input-bot-token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowToken(!showToken)}
                  data-testid="button-toggle-token-visibility"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your token from the{" "}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Discord Developer Portal
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bot-description">Description (Optional)</Label>
              <Textarea
                id="bot-description"
                placeholder="A brief description of what your bot does..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                data-testid="input-bot-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-add-bot"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-add-bot">
              Add Bot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
