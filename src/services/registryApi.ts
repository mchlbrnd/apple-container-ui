import { Registry, LoginRequest } from "@/types/registry";

// Global API interface (already defined in containerApi.ts)
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

export class RegistryApiError extends Error {
  constructor(message: string, public code?: number, public stderr?: string) {
    super(stderr && stderr.trim() ? `${message}: ${stderr.trim()}` : message);
    this.name = 'RegistryApiError';
  }
}

export class RegistryApi {
  private static checkApi() {
    if (!window.api) {
      throw new RegistryApiError('Docker API is not available. Please ensure the application is running in the correct environment.');
    }
    return window.api;
  }

  /**
   * Get the default registry status
   * Command: container registry default inspect
   */
  static async getDefaultRegistry(): Promise<Registry | null> {
    const api = this.checkApi();
    const result = await api.exec('container', ['registry', 'default', 'inspect']);
    
    if (result.code !== 0) {
      throw new RegistryApiError('Failed to get default registry', result.code, result.stderr);
    }

    try {
      const data = JSON.parse(result.stdout);
      
      // Parse the registry info from the response
      return {
        id: 'default',
        name: data.name || 'Docker Hub',
        url: data.url || 'docker.io',
        username: data.username,
        isLoggedIn: data.isLoggedIn || false,
        isDefault: true,
        lastLogin: data.lastLogin
      };
    } catch (error) {
      throw new RegistryApiError('Failed to parse registry inspect response');
    }
  }

  /**
   * Login to a registry
   * Command: container registry login <registry-url> -u <username> -p <password>
   */
  static async login(request: LoginRequest): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', [
      'registry', 
      'login', 
      request.url, 
      '-u', 
      request.username, 
      '-p', 
      request.password
    ]);

    if (result.code !== 0) {
      throw new RegistryApiError(`Failed to login to registry ${request.url}`, result.code, result.stderr);
    }
  }

  /**
   * Logout from a registry
   * Command: container registry logout <registry-url>
   */
  static async logout(registryUrl: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['registry', 'logout', registryUrl]);

    if (result.code !== 0) {
      throw new RegistryApiError(`Failed to logout from registry ${registryUrl}`, result.code, result.stderr);
    }
  }

  /**
   * Set the default registry
   * Command: container registry default set <registry-url>
   */
  static async setDefault(registryUrl: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['registry', 'default', 'set', registryUrl]);

    if (result.code !== 0) {
      throw new RegistryApiError(`Failed to set default registry to ${registryUrl}`, result.code, result.stderr);
    }
  }
}