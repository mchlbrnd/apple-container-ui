import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Registry } from "@/types/registry";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registry: Registry | null;
  onLogin: (url: string, username: string, password: string, scheme?: 'http' | 'https' | 'auto') => void;
}

export function LoginDialog({ open, onOpenChange, registry, onLogin }: LoginDialogProps) {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scheme, setScheme] = useState<'http' | 'https' | 'auto'>('auto');

  // Reset form when dialog opens/closes or registry changes
  useEffect(() => {
    if (open && registry) {
      setUrl(registry.url);
      setUsername(registry.username || "");
      setPassword("");
      setScheme('auto');
    } else if (!open) {
      setUrl("");
      setUsername("");
      setPassword("");
      setScheme('auto');
    }
  }, [open, registry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && username.trim() && password.trim()) {
      onLogin(url.trim(), username.trim(), password.trim(), scheme);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Login to {registry?.name || "Registry"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Registry URL</Label>
            <Input
              id="url"
              placeholder="https://registry.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
              disabled={!!registry} // Disable if editing existing registry
            />
            <p className="text-xs text-muted-foreground">
              The URL of the container registry
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your registry username or email
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password/Token</Label>
            <Input
              id="password"
              type="password"
              placeholder="password or access token"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your password or personal access token
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheme">Registry Scheme</Label>
            <Select value={scheme} onValueChange={(value: 'http' | 'https' | 'auto') => setScheme(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="https">HTTPS</SelectItem>
                <SelectItem value="http">HTTP</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Registry connection scheme (default: auto)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!url.trim() || !username.trim() || !password.trim()}
            >
              Login
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}