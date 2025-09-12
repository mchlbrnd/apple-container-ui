import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DNSEntry } from "@/types/system";
import { AddDNSDialog } from "./AddDNSDialog";
import { Plus, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface DNSConfigProps {
  entries: DNSEntry[];
  onAdd: (hostname: string, ipAddress: string, type: 'A' | 'AAAA' | 'CNAME') => void;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
  selectedEntryId: string | null;
  onEntryClick: (entry: DNSEntry) => void;
}

export function DNSConfig({
  entries,
  onAdd,
  onRemove,
  onSetDefault,
  selectedEntryId,
  onEntryClick
}: DNSConfigProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const selectedEntry = entries.find(entry => entry.id === selectedEntryId);
  const canSetDefault = selectedEntry && !selectedEntry.isDefault;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">DNS Configuration</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </Button>
          
          <Button
            onClick={() => selectedEntryId && onRemove(selectedEntryId)}
            disabled={!selectedEntryId}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
          
          <Button
            onClick={() => selectedEntryId && onSetDefault(selectedEntryId)}
            disabled={!canSetDefault}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Set Default
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Hostname</TableHead>
                <TableHead className="font-medium">IP Address</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="font-medium">Created</TableHead>
                <TableHead className="font-medium">Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={cn(
                    "cursor-pointer",
                    selectedEntryId === entry.id && "bg-accent"
                  )}
                  onClick={() => onEntryClick(entry)}
                >
                  <TableCell className="font-medium">
                    {entry.hostname}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {entry.ipAddress}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(entry.createdAt)}
                  </TableCell>
                  <TableCell>
                    {entry.isDefault && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No DNS entries configured</p>
            <p className="text-sm mt-1">Click "Add Entry" to configure DNS resolution</p>
          </div>
        )}
      </CardContent>

      <AddDNSDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={onAdd}
      />
    </Card>
  );
}