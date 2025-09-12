import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BuildImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuild: (contextPath: string, dockerfilePath: string, tag: string) => void;
}

export function BuildImageDialog({ open, onOpenChange, onBuild }: BuildImageDialogProps) {
  const [contextPath, setContextPath] = useState("");
  const [dockerfilePath, setDockerfilePath] = useState("Dockerfile");
  const [tag, setTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contextPath.trim() && dockerfilePath.trim() && tag.trim()) {
      onBuild(contextPath.trim(), dockerfilePath.trim(), tag.trim());
      // Reset form
      setContextPath("");
      setDockerfilePath("Dockerfile");
      setTag("");
      onOpenChange(false); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Build Image</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contextPath">Context Directory</Label>
            <Input
              id="contextPath"
              placeholder="/path/to/build/context"
              value={contextPath}
              onChange={(e) => setContextPath(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              The directory containing your Dockerfile and build context
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dockerfilePath">Dockerfile Path</Label>
            <Input
              id="dockerfilePath"
              placeholder="Dockerfile"
              value={dockerfilePath}
              onChange={(e) => setDockerfilePath(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Path to Dockerfile relative to context directory
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              placeholder="myapp:latest"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Name and tag for the built image
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!contextPath.trim() || !dockerfilePath.trim() || !tag.trim()}
            >
              Build
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}