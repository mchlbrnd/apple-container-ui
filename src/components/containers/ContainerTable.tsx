import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/types/container";
import { cn } from "@/lib/utils";

interface ContainerTableProps {
  containers: Container[];
  selectedContainers: string[];
  onSelectionChange: (selected: string[]) => void;
  onContainerSelect: (container: Container) => void;
  selectedContainer?: Container;
}

const statusColors = {
  running: "bg-success text-success-foreground",
  stopped: "bg-muted text-muted-foreground", 
  exited: "bg-muted text-muted-foreground",
  paused: "bg-warning text-warning-foreground",
  restarting: "bg-primary text-primary-foreground",
  removing: "bg-destructive text-destructive-foreground",
  created: "bg-accent text-accent-foreground",
};

export function ContainerTable({
  containers,
  selectedContainers,
  onSelectionChange,
  onContainerSelect,
  selectedContainer,
}: ContainerTableProps) {
  const isAllSelected = containers.length > 0 && selectedContainers.length === containers.length;
  const isIndeterminate = selectedContainers.length > 0 && selectedContainers.length < containers.length;

  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? containers.map(c => c.id) : []);
  };

  const handleSelectContainer = (containerId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedContainers, containerId]);
    } else {
      onSelectionChange(selectedContainers.filter(id => id !== containerId));
    }
  };

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ports</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">CPU / Memory</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {containers.map((container) => (
            <TableRow
              key={container.id}
              className={cn(
                "cursor-pointer hover:bg-accent",
                selectedContainer?.id === container.id && "bg-accent"
              )}
              onClick={() => onContainerSelect(container)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedContainers.includes(container.id)}
                  onCheckedChange={(checked) =>
                    handleSelectContainer(container.id, !!checked)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium text-sm">{container.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {container.id.substring(0, 12)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{container.image}</div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    statusColors[container.status]
                  )}
                >
                  {container.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {container.ports.length > 0 ? container.ports.join(", ") : "-"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {container.created ? 
                    formatDistanceToNow(new Date(container.created), { addSuffix: true }) : 
                    "-"
                  }
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm">
                  {container.cpu !== undefined && container.memory !== undefined ? (
                    <div className="space-y-1">
                      <div>{container.cpu.toFixed(1)}%</div>
                      <div className="text-muted-foreground">
                        {(container.memory / 1024 / 1024).toFixed(0)} MB
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}