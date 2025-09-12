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

    // Parse plain text response
    const output = result.stdout.trim();
    
    // Default registry info - the response is plain text
    // Extract URL and other info from the plain text output
    const lines = output.split('\n');
    let url = 'docker.io';
    let isLoggedIn = false;
    let username = undefined;
    
    // Parse the plain text output to extract registry information
    for (const line of lines) {
      if (line.includes('Registry:') || line.includes('URL:')) {
        const match = line.match(/:\s*(.+)$/);
        if (match) {
          url = match[1].trim();
        }
      }
      if (line.includes('Logged in') || line.includes('authenticated')) {
        isLoggedIn = true;
      }
      if (line.includes('Username:') || line.includes('User:')) {
        const match = line.match(/:\s*(.+)$/);
        if (match) {
          username = match[1].trim();
        }
      }
    }
    
    return {
      id: 'default',
      name: url === 'docker.io' ? 'Docker Hub' : url,
      url,
      username,
      isLoggedIn,
      isDefault: true,
      lastLogin: undefined
    };
  }

  /**
   * Login to a registry
   * Command: container registry login <registry-url> -u <username> --password-stdin [--scheme <scheme>]
   */
  static async login(request: LoginRequest): Promise<void> {
    const api = this.checkApi();
    const args = [
      'registry', 
      'login', 
      request.url, 
      '-u', 
      request.username, 
      '--password-stdin'
    ];

    // Add scheme option if provided
    if (request.scheme) {
      args.push('--scheme', request.scheme);
    }

    // Use spawn to handle password via stdin
    const result = await api.exec('container', args, {
      input: request.password
    });

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