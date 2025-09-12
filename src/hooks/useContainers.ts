import { useState, useEffect, useCallback } from 'react';
import { Container } from '@/types/container';
import { ContainerApi, ContainerApiError } from '@/services/containerApi';
import { useToast } from '@/hooks/use-toast';

export function useContainers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stoppingContainers, setStoppingContainers] = useState<Set<string>>(new Set());
  const [startingContainers, setStartingContainers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchContainers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching containers...');
      const containerList = await ContainerApi.listContainers();
      console.log('Raw container list:', containerList);
      console.log('Current startingContainers:', startingContainers);
      console.log('Current stoppingContainers:', stoppingContainers);
      
      // Apply stopping/starting status for containers that are in transition
      const updatedContainers = containerList.map(container => {
        console.log(`Processing container ${container.id}, status: ${container.status}`);
        
        if (stoppingContainers.has(container.id)) {
          console.log(`Container ${container.id} is in stopping set`);
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
        
        if (startingContainers.has(container.id)) {
          console.log(`Container ${container.id} is in starting set, current status: ${container.status}`);
          // If container is running, remove from starting set
          if (container.status === 'running') {
            console.log(`Container ${container.id} is now running, removing from starting set`);
            setStartingContainers(prev => {
              const newSet = new Set(prev);
              newSet.delete(container.id);
              return newSet;
            });
            return container;
          } else {
            // Container still not running, keep it as starting
            console.log(`Container ${container.id} still not running, keeping as starting`);
            return { ...container, status: 'starting' as Container['status'] };
          }
        }
        
        return container;
      });
      
      console.log('Updated containers:', updatedContainers);
      setContainers(updatedContainers);
    } catch (err) {
      console.log('Error fetching containers:', err);
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
  }, [toast, stoppingContainers, startingContainers]);

  const startContainer = useCallback(async (containerId: string) => {
    try {
      console.log('Starting container:', containerId);
      
      // Immediately set container to starting status
      setStartingContainers(prev => {
        const newSet = new Set(prev).add(containerId);
        console.log('Starting containers set:', newSet);
        return newSet;
      });
      
      setContainers(prev => prev.map(container => 
        container.id === containerId 
          ? { ...container, status: 'starting' as Container['status'] }
          : container
      ));

      console.log('About to call ContainerApi.startContainer');
      await ContainerApi.startContainer(containerId);
      console.log('ContainerApi.startContainer completed');
      
      toast({
        title: "Container Started",
        description: `Container ${containerId.substring(0, 12)} started successfully`,
      });
      
      console.log('About to fetch containers');
      await fetchContainers();
    } catch (err) {
      console.log('Error starting container:', err);
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
      await fetchContainers(); // Refresh to get actual status
    }
  }, [fetchContainers, toast]);

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
      await fetchContainers();
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
      await fetchContainers(); // Refresh to get actual status
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
      await fetchContainers();
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
      await fetchContainers(); // Refresh to get actual status
    }
  }, [fetchContainers, toast]);


  const killContainer = useCallback(async (containerId: string) => {
    try {
      await ContainerApi.killContainer(containerId);
      toast({
        title: "Container Killed",
        description: `Container ${containerId.substring(0, 12)} killed successfully`,
      });
      await fetchContainers();
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to kill container';
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
    restartContainer,
    killContainer,
    runContainer,
  };
}