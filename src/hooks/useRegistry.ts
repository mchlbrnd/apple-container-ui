import { useState, useEffect } from "react";
import { Registry } from "@/types/registry";
import { RegistryApi, RegistryApiError } from "@/services/registryApi";
import { mockRegistry } from "@/data/mockRegistry";
import { useToast } from "@/hooks/use-toast";

export function useRegistry() {
  const [registry, setRegistry] = useState<Registry | null>(mockRegistry);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRegistry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await RegistryApi.getDefaultRegistry();
      setRegistry(data);
    } catch (err) {
      const message = err instanceof RegistryApiError ? err.message : 'Failed to fetch registry';
      setError(message);
      toast({
        title: "Error loading registry",
        description: message,
        variant: "destructive"
      });
      // Fallback to mock data on error
      setRegistry(mockRegistry);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (url: string, username: string, password: string) => {
    setError(null);
    try {
      await RegistryApi.login({ url, username, password });
      
      toast({
        title: "Registry Login Successful",
        description: `Successfully logged in to ${url}`,
      });
      
      // Update local state
      if (registry) {
        setRegistry({
          ...registry,
          url,
          username,
          isLoggedIn: true,
          lastLogin: new Date().toISOString()
        });
      }
    } catch (err) {
      const message = err instanceof RegistryApiError ? err.message : 'Login failed';
      setError(message);
      toast({
        title: "Registry Login Failed",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const logout = async () => {
    if (!registry?.url) return;
    
    setError(null);
    try {
      await RegistryApi.logout(registry.url);
      
      toast({
        title: "Registry Logout Successful",
        description: `Successfully logged out from ${registry.url}`,
      });
      
      // Update local state
      setRegistry(prev => prev ? {
        ...prev,
        isLoggedIn: false,
        username: undefined,
        lastLogin: undefined
      } : null);
    } catch (err) {
      const message = err instanceof RegistryApiError ? err.message : 'Logout failed';
      setError(message);
      toast({
        title: "Registry Logout Failed",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const setDefault = async (url: string) => {
    setError(null);
    try {
      await RegistryApi.setDefault(url);
      
      toast({
        title: "Default Registry Set",
        description: `Successfully set ${url} as default registry`,
      });
      
      // Update local state
      if (registry) {
        setRegistry({
          ...registry,
          url,
          isDefault: true
        });
      }
    } catch (err) {
      const message = err instanceof RegistryApiError ? err.message : 'Failed to set default registry';
      setError(message);
      toast({
        title: "Failed to Set Default Registry",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  return {
    registry,
    isLoading,
    error,
    login,
    logout,
    setDefault,
    refetch: fetchRegistry
  };
}