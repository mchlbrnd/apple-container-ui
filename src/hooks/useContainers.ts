import { useState, useEffect, useCallback, useRef } from 'react';
import { Container } from '@/types/container';
import { ContainerApi, ContainerApiError } from '@/services/containerApi';
import { useToast } from '@/hooks/use-toast';

// Shallow comparison helper for containers
const containersEqual = (a: Container[], b: Container[]) => {
  if (a.length !== b.length) return false;
  return a.every((container, index) => {
    const other = b[index];
    return container.id === other.id && 
           container.status === other.status &&
           container.name === other.name &&
           container.image === other.image;
  });
};

export function useContainers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stoppingContainers, setStoppingContainers] = useState<Set<string>>(new Set());
  const [startingContainers, setStartingContainers] = useState<Set<string>>(new Set());
  const [isPolling, setIsPolling] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(2000); // 2 seconds default
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const fetchContainers = useCallback(async (isInitialFetch = false) => {
    try {
      // Only show loading state on initial fetch, not during polling
      if (isInitialFetch) {
        setLoading(true);
      }
      setError(null);
      const containerList = await ContainerApi.listContainers();
      
      // Apply stopping/starting status for containers that are in transition
      const updatedContainers = containerList.map(container => {
        // Prefer 'starting' if both flags exist
        if (startingContainers.has(container.id)) {
          if (container.status === 'running') {
            setStartingContainers(prev => {
              const newSet = new Set(prev);
              newSet.delete(container.id);
              return newSet;
            });
            return container;
          } else {
            return { ...container, status: 'starting' as Container['status'] };
          }
        }
        
        if (stoppingContainers.has(container.id)) {
          // If container is still running, keep it as stopping
          if (container.status === 'running') {
            return { ...container, status: 'stopping' as Container['status'] };
          } else {
            // Container has stopped, remove from stopping set
            setStoppingContainers(prev => {
              const newSet = new Set(prev);
              newSet.delete(container.id);
              return newSet;
            });
            return container;
          }
        }
        
        return container;
      });
      
      // Only update state if containers have actually changed
      setContainers(prev => {
        if (containersEqual(prev, updatedContainers)) {
          return prev; // No change, return same reference to prevent re-render
        }
        return updatedContainers;
      });
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
      if (isInitialFetch) {
        setLoading(false);
      }
    }
  }, [toast, stoppingContainers, startingContainers]);

  // Polling mechanism
  useEffect(() => {
    if (isPolling) {
      fetchContainers(true); // Initial fetch with loading state
      
      intervalRef.current = setInterval(() => {
        fetchContainers(false); // Polling fetches without loading state
      }, pollingInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchContainers, isPolling, pollingInterval]);

  const startPolling = useCallback(() => setIsPolling(true), []);
  const stopPolling = useCallback(() => setIsPolling(false), []);
  const setPollingRate = useCallback((interval: number) => setPollingInterval(interval), []);

  const startContainer = useCallback(async (containerId: string) => {
    try {
      // Immediately set container to starting status
      setStartingContainers(prev => {
        // Clear from stopping set if present to avoid conflicts with 'stopping' overlay
        setStoppingContainers(prevStop => {
          const s = new Set(prevStop);
          s.delete(containerId);
          return s;
        });
        const newSet = new Set(prev);
        newSet.add(containerId);
        return newSet;
      });
      
      setContainers(prev => prev.map(container => 
        container.id === containerId 
          ? { ...container, status: 'starting' as Container['status'] }
          : container
      ));

      await ContainerApi.startContainer(containerId);
      
      toast({
        title: "Container Started",
        description: `Container ${containerId.substring(0, 12)} started successfully`,
      });
    } catch (err) {
      // Remove from starting set if error occurs
      setStartingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerId);
        return newSet;
      });
      
      const message = err instanceof ContainerApiError ? err.message : 'Failed to start container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopContainer = useCallback(async (containerId: string) => {
    try {
      // Immediately set container to stopping status
      setStoppingContainers(prev => new Set(prev).add(containerId));
      setContainers(prev => prev.map(container => 
        container.id === containerId 
          ? { ...container, status: 'stopping' as Container['status'] }
          : container
      ));

      await ContainerApi.stopContainer(containerId);
      toast({
        title: "Container Stopped",
        description: `Container ${containerId.substring(0, 12)} stopped successfully`,
      });
    } catch (err) {
      // Remove from stopping set if error occurs
      setStoppingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerId);
        return newSet;
      });
      
      const message = err instanceof ContainerApiError ? err.message : 'Failed to stop container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteContainer = useCallback(async (containerId: string) => {
    try {
      await ContainerApi.deleteContainer(containerId);
      toast({
        title: "Container Deleted",
        description: `Container ${containerId.substring(0, 12)} deleted successfully`,
      });
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to delete container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const restartContainer = useCallback(async (containerId: string) => {
    try {
      // Immediately set container to stopping status since restart involves stopping
      setStoppingContainers(prev => new Set(prev).add(containerId));
      setContainers(prev => prev.map(container => 
        container.id === containerId 
          ? { ...container, status: 'stopping' as Container['status'] }
          : container
      ));

      await ContainerApi.restartContainer(containerId);
      
      // Remove from stopping set after successful restart
      setStoppingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerId);
        return newSet;
      });
      
      toast({
        title: "Container Restarted",
        description: `Container ${containerId.substring(0, 12)} restarted successfully`,
      });
    } catch (err) {
      // Remove from stopping set if error occurs
      setStoppingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerId);
        return newSet;
      });
      
      const message = err instanceof ContainerApiError ? err.message : 'Failed to restart container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [toast]);


  const killContainer = useCallback(async (containerId: string) => {
    try {
      await ContainerApi.killContainer(containerId);
      toast({
        title: "Container Killed",
        description: `Container ${containerId.substring(0, 12)} killed successfully`,
      });
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to kill container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [toast]);

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
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to run container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const refresh = useCallback(() => fetchContainers(true), [fetchContainers]);

  return {
    containers,
    loading,
    error,
    refresh,
    startContainer,
    stopContainer,
    deleteContainer,
    restartContainer,
    killContainer,
    runContainer,
    // Polling controls
    isPolling,
    pollingInterval,
    startPolling,
    stopPolling,
    setPollingRate,
  };
}