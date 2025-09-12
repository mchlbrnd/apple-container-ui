import { Container } from '@/types/container';

// Global API interface
declare global {
  interface Window {
    api?: {
      exec: (command: string, args?: string[], options?: any) => Promise<{ code: number; stdout: string; stderr: string }>;
      spawn: (command: string, args?: string[], options?: any) => Promise<{ runId: string }>;
      onSpawnStdout: (handler: (data: string) => void) => () => void;
      onSpawnStderr: (handler: (data: string) => void) => () => void;
      onSpawnClose: (handler: (code: number) => void) => () => void;
      kill: (runId: string, signal?: string) => Promise<{ ok: boolean; error?: string }>;
    };
  }
}

export class ContainerApiError extends Error {
  constructor(message: string, public code?: number, public stderr?: string) {
    super(stderr && stderr.trim() ? `${message}: ${stderr.trim()}` : message);
    this.name = 'ContainerApiError';
  }
}

export class ContainerApi {
  private static checkApi() {
    if (!window.api) {
      throw new ContainerApiError('Docker API is not available. Please ensure the application is running in the correct environment.');
    }
    return window.api;
  }

  static async listContainers(includeAll = true): Promise<Container[]> {
    const api = this.checkApi();
    const args = ['list'];
    if (includeAll) args.push('--all');
    
    // Try with JSON format first
    let result = await api.exec('container', [...args, '--format', 'json']);
    let useJsonFormat = true;
    
    // If JSON format fails, try without it
    if (result.code !== 0) {
      result = await api.exec('container', args);
      useJsonFormat = false;
      
      if (result.code !== 0) {
        throw new ContainerApiError('Failed to list containers', result.code, result.stderr);
      }
    }

    try {
      if (useJsonFormat) {
        // Parse JSON output
        const rawContainers = JSON.parse(result.stdout);
        return rawContainers.map((raw: any) => ({
          id: raw.configuration?.id || raw.id,
          name: raw.configuration?.networks?.[0]?.options?.hostname || raw.configuration?.id?.substring(0, 12) || 'unknown',
          image: raw.configuration?.image?.reference || raw.image,
          status: (raw.status as Container['status']) || 'created',
          ports: raw.configuration?.publishedPorts?.map((port: any) => 
            `${port.hostPort}:${port.containerPort}/${port.protocol}`
          ) || [],
          networks: raw.networks || [],
          labels: raw.configuration?.labels || {},
          configuration: raw.configuration
        }));
      } else {
        // Parse text output - get detailed info via inspect for each container
        const lines = result.stdout.trim().split('\n').filter(line => line.trim());
        const containers: Container[] = [];
        
        for (const line of lines) {
          // Extract container ID from the line (first column)
          const parts = line.trim().split(/\s+/);
          if (parts.length > 0) {
            const containerId = parts[0];
            try {
              // Get detailed info via inspect
              const inspectData = await this.inspectContainer(containerId);
              containers.push({
                id: inspectData.id || containerId,
                name: inspectData.name || containerId.substring(0, 12),
                image: inspectData.image || 'unknown',
                status: (inspectData.status as Container['status']) || 'created',
                ports: inspectData.ports || [],
                networks: inspectData.networks || [],
                labels: inspectData.labels || {},
                configuration: inspectData.configuration
              });
            } catch (error) {
              // If inspect fails, create basic container info
              containers.push({
                id: containerId,
                name: containerId.substring(0, 12),
                image: 'unknown',
                status: 'created' as Container['status'],
                ports: [],
                networks: [],
                labels: {},
                configuration: undefined
              });
            }
          }
        }
        
        return containers;
      }
    } catch (error) {
      throw new ContainerApiError('Failed to parse container list response');
    }
  }

  static async inspectContainer(containerId: string): Promise<any> {
    const api = this.checkApi();
    const result = await api.exec('container', ['inspect', containerId]);
    
    if (result.code !== 0) {
      throw new ContainerApiError(`Failed to inspect container ${containerId}`, result.code, result.stderr);
    }

    try {
      return JSON.parse(result.stdout);
    } catch (error) {
      throw new ContainerApiError('Failed to parse container inspect response');
    }
  }

  static async startContainer(containerId: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['start', containerId]);
    
    if (result.code !== 0) {
      throw new ContainerApiError(`Failed to start container ${containerId}`, result.code, result.stderr);
    }
  }

  static async stopContainer(containerId: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['stop', containerId]);
    
    if (result.code !== 0) {
      throw new ContainerApiError(`Failed to stop container ${containerId}`, result.code, result.stderr);
    }
  }

  static async deleteContainer(containerId: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['delete', containerId]);
    
    if (result.code !== 0) {
      throw new ContainerApiError(`Failed to delete container ${containerId}`, result.code, result.stderr);
    }
  }

  static async restartContainer(containerId: string): Promise<void> {
    // First stop the container
    await this.stopContainer(containerId);
    
    // Wait for container to be stopped
    let attempts = 0;
    const maxAttempts = 30; // 15 seconds timeout
    
    while (attempts < maxAttempts) {
      try {
        const containers = await this.listContainers();
        const container = containers.find(c => c.id === containerId);
        
        if (container && (container.status === 'stopped' || container.status === 'exited')) {
          break;
        }
      } catch (error) {
        // Continue waiting if inspect fails
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    // Then start the container
    await this.startContainer(containerId);
  }


  static async killContainer(containerId: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['kill', containerId]);
    
    if (result.code !== 0) {
      throw new ContainerApiError(`Failed to kill container ${containerId}`, result.code, result.stderr);
    }
  }

  static async runContainer(options: {
    name?: string;
    image: string;
    ports?: string[];
    environment?: Record<string, string>;
    volumes?: string[];
    detached?: boolean;
    remove?: boolean;
  }): Promise<void> {
    const api = this.checkApi();
    const args = ['run'];
    
    if (options.name) {
      args.push('--name', options.name);
    }
    
    if (options.detached) {
      args.push('-d');
    }
    
    if (options.remove) {
      args.push('--rm');
    }
    
    if (options.ports) {
      options.ports.forEach(port => {
        args.push('-p', port);
      });
    }
    
    if (options.environment) {
      Object.entries(options.environment).forEach(([key, value]) => {
        args.push('-e', `${key}=${value}`);
      });
    }
    
    if (options.volumes) {
      options.volumes.forEach(volume => {
        args.push('-v', volume);
      });
    }
    
    args.push(options.image);
    
    const result = await api.exec('container', args);
    
    if (result.code !== 0) {
      throw new ContainerApiError(`Failed to run container from ${options.image}`, result.code, result.stderr);
    }
  }

  static async getContainerLogs(containerId: string, follow = false): Promise<{ runId?: string; logs?: string }> {
    const api = this.checkApi();
    const args = ['logs', containerId];
    
    if (follow) {
      args.push('--follow');
      const result = await api.spawn('container', args);
      return { runId: result.runId };
    } else {
      const result = await api.exec('container', args);
      if (result.code !== 0) {
        throw new ContainerApiError(`Failed to get logs for container ${containerId}`, result.code, result.stderr);
      }
      return { logs: result.stdout };
    }
  }

  static async execInContainer(containerId: string, command = '/bin/sh'): Promise<string> {
    const api = this.checkApi();
    const result = await api.spawn('container', ['exec', '-it', containerId, command]);
    return result.runId;
  }
}