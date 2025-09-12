import {
  Play,
  Square,
  Trash2,
  Eye,
  FileText,
  Plus,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContainerToolbarProps {
  onRun: () => void;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
  onInspect: () => void;
  onLogs: () => void;
  onRefresh: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  selectedCount: number;
}

export function ContainerToolbar({
  onRun,
  onStart,
  onStop,
  onDelete,
  onInspect,
  onLogs,
  onRefresh,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedCount,
}: ContainerToolbarProps) {
  return (
    <div className="border-b border-border bg-card">
      {/* Toolbar Actions */}
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="default"
          size="sm"
          onClick={onRun}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Run
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onStart}
          disabled={selectedCount === 0}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Start
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onStop}
          disabled={selectedCount === 0}
          className="gap-2"
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={selectedCount === 0}
          className="gap-2 hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onInspect}
          disabled={selectedCount !== 1}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Inspect
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onLogs}
          disabled={selectedCount !== 1}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Logs
        </Button>
        
        <div className="flex-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3 px-3 pb-3">
        <Input
          placeholder="Search containers..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="stopped">Stopped</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}