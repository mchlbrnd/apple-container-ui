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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddDNSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (hostname: string, ipAddress: string, type: 'A' | 'AAAA' | 'CNAME') => void;
}

export function AddDNSDialog({ open, onOpenChange, onAdd }: AddDNSDialogProps) {
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [type, setType] = useState<'A' | 'AAAA' | 'CNAME'>('A');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostname.trim() && ipAddress.trim()) {
      onAdd(hostname.trim(), ipAddress.trim(), type);
      // Reset form
      setHostname("");
      setIpAddress("");
      setType('A');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add DNS Entry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hostname">Hostname</Label>
            <Input
              id="hostname"
              placeholder="api.local"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              The hostname to resolve
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input
              id="ipAddress"
              placeholder="192.168.1.100"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The IP address to resolve to
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Record Type</Label>
            <Select value={type} onValueChange={(value: 'A' | 'AAAA' | 'CNAME') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A (IPv4)</SelectItem>
                <SelectItem value="AAAA">AAAA (IPv6)</SelectItem>
                <SelectItem value="CNAME">CNAME (Alias)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The type of DNS record
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!hostname.trim() || !ipAddress.trim()}
            >
              Add Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}