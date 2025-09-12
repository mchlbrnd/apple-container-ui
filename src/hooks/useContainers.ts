import { useState, useEffect, useCallback } from 'react';
import { Container } from '@/types/container';
import { ContainerApi, ContainerApiError } from '@/services/containerApi';
import { useToast } from '@/hooks/use-toast';

export function useContainers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContainers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const containerList = await ContainerApi.listContainers();
      setContainers(containerList);
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to fetch containers';
      setError(message);
      
      if (err instanceof ContainerApiError && err.message.includes('Docker API is not available')) {
        // Show error dialog for missing API
        toast({
          title: "Docker API Unavailable",
          description: "The Docker API is not available. Please ensure the application is running in the correct environment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startContainer = useCallback(async (containerId: string) => {
    try {
      await ContainerApi.startContainer(containerId);
      toast({
        title: "Container Started",
        description: `Container ${containerId.substring(0, 12)} started successfully`,
      });
      await fetchContainers();
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to start container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [fetchContainers, toast]);

  const stopContainer = useCallback(async (containerId: string) => {
    try {
      await ContainerApi.stopContainer(containerId);
      toast({
        title: "Container Stopped",
        description: `Container ${containerId.substring(0, 12)} stopped successfully`,
      });
      await fetchContainers();
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to stop container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [fetchContainers, toast]);

  const deleteContainer = useCallback(async (containerId: string) => {
    try {
      await ContainerApi.deleteContainer(containerId);
      toast({
        title: "Container Deleted",
        description: `Container ${containerId.substring(0, 12)} deleted successfully`,
      });
      await fetchContainers();
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to delete container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [fetchContainers, toast]);

  const runContainer = useCallback(async (options: {
    name?: string;
    image: string;
    ports?: string[];
    environment?: Record<string, string>;
    volumes?: string[];
    detached?: boolean;
    remove?: boolean;
  }) => {
    try {
      await ContainerApi.runContainer(options);
      toast({
        title: "Container Running",
        description: `Container from ${options.image} started successfully`,
      });
      await fetchContainers();
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to run container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [fetchContainers, toast]);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  return {
    containers,
    loading,
    error,
    refresh: fetchContainers,
    startContainer,
    stopContainer,
    deleteContainer,
    runContainer,
  };
}