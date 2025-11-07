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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File, Plus, Edit, Trash2, Grid3x3, List, FolderPlus, Upload, UploadCloud, Search } from "lucide-react";
import type { BotFile } from "@shared/schema";

interface EnhancedFileManagerProps {
  botId: string;
  files: BotFile[];
  onCreateFile: (file: { filename: string; path: string; content: string; size: string }) => void;
  onUpdateFile: (fileId: string, content: string) => void;
  onDeleteFile: (fileId: string) => void;
  onCreateFolder?: (path: string) => void;
}

export function EnhancedFileManager({
  botId,
  files,
  onCreateFile,
  onUpdateFile,
  onDeleteFile,
  onCreateFolder,
}: EnhancedFileManagerProps) {
  const [selectedFile, setSelectedFile] = useState<BotFile | null>(null);
  const [editContent, setEditContent] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [uploadFolderDialogOpen, setUploadFolderDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-az");
  const [currentPath, setCurrentPath] = useState("/home/container/");
  const [newFile, setNewFile] = useState({
    filename: "",
    path: currentPath,
    content: "",
  });
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  const handleCreateFile = () => {
    const size = new Blob([newFile.content]).size;
    onCreateFile({
      ...newFile,
      size: `${(size / 1024).toFixed(2)} KB`,
    });
    setNewFile({ filename: "", path: currentPath, content: "" });
    setCreateDialogOpen(false);
  };

  const handleCreateFolder = () => {
    if (onCreateFolder && newFolderName) {
      onCreateFolder(`${currentPath}${newFolderName}`);
      setNewFolderName("");
      setCreateFolderDialogOpen(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = async (e) => {
        let content = e.target?.result as string;
        const size = file.size;
        
        // For binary files, content is already base64 if we use readAsDataURL
        // For text files, it's the raw text
        const isBinary = !file.type.startsWith('text/') && 
                        !file.name.match(/\.(js|ts|jsx|tsx|json|md|txt|html|css|py|java|cpp|c|h)$/i);
        
        onCreateFile({
          filename: file.name,
          path: currentPath,
          content: content,
          size: `${(size / 1024).toFixed(2)} KB`,
        });
      };

      // Read as text for text files, as data URL for binary files
      const isBinary = !file.type.startsWith('text/') && 
                      !file.name.match(/\.(js|ts|jsx|tsx|json|md|txt|html|css|py|java|cpp|c|h)$/i);
      
      if (isBinary) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }

    setUploadDialogOpen(false);
    if (event.target) {
      event.target.value = '';
    }
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

  const filteredFiles = files
    .filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.path.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name-az":
          return a.filename.localeCompare(b.filename);
        case "name-za":
          return b.filename.localeCompare(a.filename);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
          <File className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-foreground dark:text-foreground">File Manager</h2>
        <p className="text-muted-foreground">Organize and manage your bot files.</p>
      </div>

      <div className="bg-card dark:bg-card rounded-lg border border-border dark:border-border p-4">
        <div className="text-sm font-mono text-muted-foreground mb-4" data-testid="text-current-path">
          {currentPath}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" data-testid="button-create-file">
                Create File
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-file">
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
                <DialogDescription>Add a new file to your bot project.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    placeholder="index.js"
                    value={newFile.filename}
                    onChange={(e) => setNewFile({ ...newFile, filename: e.target.value })}
                    data-testid="input-filename"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="path">Path</Label>
                  <Input
                    id="path"
                    placeholder={currentPath}
                    value={newFile.path}
                    onChange={(e) => setNewFile({ ...newFile, path: e.target.value })}
                    data-testid="input-path"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="// Your bot code here"
                    value={newFile.content}
                    onChange={(e) => setNewFile({ ...newFile, content: e.target.value })}
                    rows={10}
                    className="font-mono text-sm"
                    data-testid="input-content"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel-create">
                  Cancel
                </Button>
                <Button onClick={handleCreateFile} data-testid="button-save-file">
                  Create File
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" data-testid="button-upload-files">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-upload-files">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Select one or more files to upload to {currentPath}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Choose Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    data-testid="input-file-upload"
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can select multiple files to upload at once.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadFolderDialogOpen} onOpenChange={setUploadFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" data-testid="button-upload-folder">
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Folder
                <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 text-xs rounded">
                  EXPERIMENTAL
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-upload-folder">
              <DialogHeader>
                <DialogTitle>Upload Folder (Experimental)</DialogTitle>
                <DialogDescription>
                  This feature is experimental and may not work as expected.
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Folder upload functionality coming soon.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUploadFolderDialogOpen(false)}
                  data-testid="button-close-upload-folder"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" data-testid="button-create-folder">
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-folder">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>Add a new folder to organize your files.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foldername">Folder Name</Label>
                  <Input
                    id="foldername"
                    placeholder="my-folder"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    data-testid="input-foldername"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateFolderDialogOpen(false)}
                  data-testid="button-cancel-folder"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder} data-testid="button-save-folder">
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-files"
          />
        </div>

        <div className="mb-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-az">Name (A-Z)</SelectItem>
              <SelectItem value="name-za">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="flex-1"
            data-testid="button-view-grid"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="flex-1"
            data-testid="button-view-list"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-96 border rounded-md">
        <div className="p-4">
          {filteredFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchTerm ? "No files match your search." : "No files yet. Create your first file to get started."}
            </p>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-3" : "space-y-2"}>
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-3 rounded-md border hover:bg-accent dark:hover:bg-accent ${
                    viewMode === "grid" ? "flex-col items-start" : ""
                  }`}
                  data-testid={`file-item-${file.id}`}
                >
                  <div className={`flex items-center gap-3 ${viewMode === "grid" ? "w-full" : "flex-1 min-w-0"}`}>
                    <File className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.filename}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file.path} • {file.size}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${viewMode === "grid" ? "w-full justify-end mt-2" : ""}`}>
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
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl" data-testid="dialog-edit-file">
          <DialogHeader>
            <DialogTitle>Edit {selectedFile?.filename}</DialogTitle>
            <DialogDescription>Make changes to your file and save when you're done.</DialogDescription>
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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} data-testid="button-cancel-edit">
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
