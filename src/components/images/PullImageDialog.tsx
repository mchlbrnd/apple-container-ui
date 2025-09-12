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
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface PullImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPull: (registry: string, username?: string, password?: string) => void;
}

export function PullImageDialog({ open, onOpenChange, onPull }: PullImageDialogProps) {
  const [registry, setRegistry] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registry.trim()) {
      onPull(
        registry.trim(),
        needsAuth && username ? username : undefined,
        needsAuth && password ? password : undefined
      );
      // Reset form
      setRegistry("");
      setUsername("");
      setPassword("");
      setNeedsAuth(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pull Image</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="registry">Image</Label>
            <Input
              id="registry"
              placeholder="nginx:latest or registry.example.com/myapp:v1.0"
              value={registry}
              onChange={(e) => setRegistry(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the full image name including registry and tag
            </p>
          </div>

          <Collapsible open={needsAuth} onOpenChange={setNeedsAuth}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="text-sm font-medium">Authentication (Optional)</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${needsAuth ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Registry username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password/Token</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Registry password or token"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!registry.trim()}>
              Pull
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}