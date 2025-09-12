import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Star } from "lucide-react";

interface RegistryToolbarProps {
  onLogin: () => void;
  onLogout: () => void;
  onSetDefault: () => void;
  selectedRegistryId: string | null;
  canLogout: boolean;
  canSetDefault: boolean;
}

export function RegistryToolbar({
  onLogin,
  onLogout,
  onSetDefault,
  selectedRegistryId,
  canLogout,
  canSetDefault
}: RegistryToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLogin}
          disabled={!selectedRegistryId}
        >
          <LogIn className="w-4 h-4" />
          Login
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLogout}
          disabled={!canLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSetDefault}
          disabled={!canSetDefault}
        >
          <Star className="w-4 h-4" />
          Set Default
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {selectedRegistryId ? "Select actions for registry" : "Select a registry to manage"}
      </div>
    </div>
  );
}