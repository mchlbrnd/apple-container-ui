import { useState } from "react";
import { Registry } from "@/types/registry";
import { mockRegistries } from "@/data/mockRegistries";
import { RegistryToolbar } from "@/components/registry/RegistryToolbar";
import { RegistryList } from "@/components/registry/RegistryList";
import { LoginDialog } from "@/components/registry/LoginDialog";
import { useToast } from "@/hooks/use-toast";

export default function RegistryPage() {
  const [registries, setRegistries] = useState<Registry[]>(mockRegistries);
  const [selectedRegistry, setSelectedRegistry] = useState<Registry | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleRegistryClick = (registry: Registry) => {
    setSelectedRegistry(registry);
  };

  const handleLogin = () => {
    if (selectedRegistry) {
      setLoginDialogOpen(true);
    }
  };

  const handleLoginSubmit = (url: string, username: string, password: string) => {
    if (selectedRegistry) {
      // Update the registry login status
      setRegistries(prev => prev.map(reg => 
        reg.id === selectedRegistry.id 
          ? { 
              ...reg, 
              isLoggedIn: true, 
              username,
              lastLogin: new Date().toISOString()
            }
          : reg
      ));
      
      // Update selected registry
      setSelectedRegistry(prev => prev ? {
        ...prev,
        isLoggedIn: true,
        username,
        lastLogin: new Date().toISOString()
      } : null);

      toast({
        title: "Login successful",
        description: `Successfully logged in to ${selectedRegistry.name}`,
      });
    }
  };

  const handleLogout = () => {
    if (selectedRegistry && selectedRegistry.isLoggedIn) {
      // Update the registry login status
      setRegistries(prev => prev.map(reg => 
        reg.id === selectedRegistry.id 
          ? { ...reg, isLoggedIn: false, username: undefined }
          : reg
      ));
      
      // Update selected registry
      setSelectedRegistry(prev => prev ? {
        ...prev,
        isLoggedIn: false,
        username: undefined
      } : null);

      toast({
        title: "Logout successful",
        description: `Successfully logged out from ${selectedRegistry.name}`,
      });
    }
  };

  const handleSetDefault = () => {
    if (selectedRegistry && selectedRegistry.isLoggedIn && !selectedRegistry.isDefault) {
      // Remove default from all registries and set new default
      setRegistries(prev => prev.map(reg => ({
        ...reg,
        isDefault: reg.id === selectedRegistry.id
      })));
      
      // Update selected registry
      setSelectedRegistry(prev => prev ? { ...prev, isDefault: true } : null);

      toast({
        title: "Default registry set",
        description: `${selectedRegistry.name} is now the default registry`,
      });
    }
  };

  const canLogout = selectedRegistry?.isLoggedIn || false;
  const canSetDefault = selectedRegistry?.isLoggedIn && !selectedRegistry?.isDefault || false;

  return (
    <div className="h-full flex flex-col">
      <RegistryToolbar
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSetDefault={handleSetDefault}
        selectedRegistryId={selectedRegistry?.id || null}
        canLogout={canLogout}
        canSetDefault={canSetDefault}
      />
      
      <div className="flex-1 overflow-hidden">
        <RegistryList
          registries={registries}
          selectedRegistryId={selectedRegistry?.id || null}
          onRegistryClick={handleRegistryClick}
        />
      </div>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        registry={selectedRegistry}
        onLogin={handleLoginSubmit}
      />
    </div>
  );
}