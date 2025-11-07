import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File, Plus, Edit, Trash2 } from "lucide-react";
import type { BotFile } from "@shared/schema";

interface FileManagerProps {
  botId: string;
  files: BotFile[];
  onCreateFile: (file: { filename: string; path: string; content: string; size: string }) => void;
  onUpdateFile: (fileId: string, content: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export function FileManager({
  botId,
  files,
  onCreateFile,
  onUpdateFile,
  onDeleteFile,
}: FileManagerProps) {
  const [selectedFile, setSelectedFile] = useState<BotFile | null>(null);
  const [editContent, setEditContent] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newFile, setNewFile] = useState({
    filename: "",
    path: "/",
    content: "",
  });

  const handleCreateFile = () => {
    const size = new Blob([newFile.content]).size;
    onCreateFile({
      ...newFile,
      size: `${(size / 1024).toFixed(2)} KB`,
    });
    setNewFile({ filename: "", path: "/", content: "" });
    setCreateDialogOpen(false);
  };

  const handleEditFile = (file: BotFile) => {
    setSelectedFile(file);
    setEditContent(file.content);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedFile) {
      onUpdateFile(selectedFile.id, editContent);
      setEditDialogOpen(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Files</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-create-file">
              <Plus className="w-4 h-4" />
              New File
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-file">
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
              <DialogDescription>
                Add a new file to your bot project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  placeholder="index.js"
                  value={newFile.filename}
                  onChange={(e) =>
                    setNewFile({ ...newFile, filename: e.target.value })
                  }
                  data-testid="input-filename"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="path">Path</Label>
                <Input
                  id="path"
                  placeholder="/"
                  value={newFile.path}
                  onChange={(e) =>
                    setNewFile({ ...newFile, path: e.target.value })
                  }
                  data-testid="input-path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="// Your bot code here"
                  value={newFile.content}
                  onChange={(e) =>
                    setNewFile({ ...newFile, content: e.target.value })
                  }
                  rows={10}
                  className="font-mono text-sm"
                  data-testid="input-content"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFile} data-testid="button-save-file">
                Create File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-96 border rounded-md">
        <div className="p-4 space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No files yet. Create your first file to get started.
            </p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-md border hover-elevate"
                data-testid={`file-item-${file.id}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.filename}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {file.path} • {file.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditFile(file)}
                    data-testid={`button-edit-${file.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteFile(file.id)}
                    data-testid={`button-delete-${file.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl" data-testid="dialog-edit-file">
          <DialogHeader>
            <DialogTitle>Edit {selectedFile?.filename}</DialogTitle>
            <DialogDescription>
              Make changes to your file and save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              data-testid="input-edit-content"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} data-testid="button-save-edit">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
