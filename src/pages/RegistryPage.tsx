import { useState } from "react";
import { useRegistry } from "@/hooks/useRegistry";
import { RegistryToolbar } from "@/components/registry/RegistryToolbar";
import { RegistryCard } from "@/components/registry/RegistryCard";
import { LoginDialog } from "@/components/registry/LoginDialog";
import { useToast } from "@/hooks/use-toast";

export default function RegistryPage() {
  const { registry, isLoading, error, login, logout, setDefault } = useRegistry();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleLoginSubmit = async (url: string, username: string, password: string, scheme?: 'http' | 'https' | 'auto') => {
    try {
      await login(url, username, password, scheme);
      toast({
        title: "Login successful",
        description: `Successfully logged in to registry`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout successful",
        description: `Successfully logged out from registry`,
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (url: string) => {
    try {
      await setDefault(url);
      toast({
        title: "Default registry set",
        description: `Registry is now the default`,
      });
    } catch (error) {
      toast({
        title: "Failed to set default",
        description: error instanceof Error ? error.message : "Failed to set default registry",
        variant: "destructive",
      });
    }
  };

  const canLogin = true;
  const canLogout = registry?.isLoggedIn || false;

  return (
    <div className="h-full flex flex-col">
      <RegistryToolbar
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSetDefault={handleSetDefault}
        canLogin={canLogin}
        canLogout={canLogout}
        isLoading={isLoading}
      />
      
      <div className="flex-1 overflow-hidden p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading registry...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : (
          <RegistryCard registry={registry} />
        )}
      </div>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        registry={registry}
        onLogin={handleLoginSubmit}
      />
    </div>
  );
}