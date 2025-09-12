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
    super(message);
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
    args.push('--format', 'json');

    const result = await api.exec('container', args);
    
    if (result.code !== 0) {
      throw new ContainerApiError('Failed to list containers', result.code, result.stderr);
    }

    try {
      const containers = JSON.parse(result.stdout) as Container[];
      return containers;
    } catch (error) {
      throw new ContainerApiError('Failed to parse container list response');
    }
  }

  static async inspectContainer(containerId: string): Promise<any> {
    const api = this.checkApi();
    const result = await api.exec('container', ['inspect', containerId, '--format', 'json']);
    
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