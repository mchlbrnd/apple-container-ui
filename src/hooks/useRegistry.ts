import { useState, useEffect } from "react";
import { Registry } from "@/types/registry";
import { RegistryApi } from "@/services/registryApi";
import { mockRegistry } from "@/data/mockRegistry";

export function useRegistry() {
  const [registry, setRegistry] = useState<Registry | null>(mockRegistry);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await RegistryApi.getDefaultRegistry();
      setRegistry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registry');
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
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    if (!registry?.url) return;
    
    setError(null);
    try {
      await RegistryApi.logout(registry.url);
      
      // Update local state
      setRegistry(prev => prev ? {
        ...prev,
        isLoggedIn: false,
        username: undefined,
        lastLogin: undefined
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    }
  };

  const setDefault = async (url: string) => {
    setError(null);
    try {
      await RegistryApi.setDefault(url);
      
      // Update local state
      if (registry) {
        setRegistry({
          ...registry,
          url,
          isDefault: true
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default registry');
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