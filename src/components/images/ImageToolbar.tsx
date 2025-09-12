import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Hammer, 
  Tag, 
  Upload, 
  Trash2, 
  Scissors,
  Search 
} from "lucide-react";

interface ImageToolbarProps {
  onPull: () => void;
  onBuild: () => void;
  onTag: () => void;
  onPush: () => void;
  onDelete: () => void;
  onPrune: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCount: number;
}

export function ImageToolbar({
  onPull,
  onBuild,
  onTag,
  onPush,
  onDelete,
  onPrune,
  searchQuery,
  onSearchChange,
  selectedCount
}: ImageToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onPull}
        >
          <Download className="w-4 h-4" />
          Pull
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBuild}
        >
          <Hammer className="w-4 h-4" />
          Build
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onTag}
          disabled={selectedCount !== 1}
        >
          <Tag className="w-4 h-4" />
          Tag
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onPush}
          disabled={selectedCount === 0}
        >
          <Upload className="w-4 h-4" />
          Push
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onDelete}
          disabled={selectedCount === 0}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onPrune}
        >
          <Scissors className="w-4 h-4" />
          Prune
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>
    </div>
  );
}