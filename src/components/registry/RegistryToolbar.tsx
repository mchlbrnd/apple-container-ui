import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Star } from "lucide-react";

interface RegistryToolbarProps {
  onLogin: () => void;
  onLogout: () => void;
  onSetDefault: (url: string) => void;
  canLogin: boolean;
  canLogout: boolean;
  isLoading: boolean;
}

export function RegistryToolbar({
  onLogin,
  onLogout,
  onSetDefault,
  canLogin,
  canLogout,
  isLoading
}: RegistryToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLogin}
          disabled={!canLogin || isLoading}
        >
          <LogIn className="w-4 h-4" />
          Login
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLogout}
          disabled={!canLogout || isLoading}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {isLoading ? "Loading..." : "Manage default registry"}
      </div>
    </div>
  );
}