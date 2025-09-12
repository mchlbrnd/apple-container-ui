import { Registry, LoginRequest } from "@/types/registry";

export class RegistryApiError extends Error {
  constructor(message: string, public code?: number, public stderr?: string) {
    super(stderr && stderr.trim() ? `${message}: ${stderr.trim()}` : message);
    this.name = 'RegistryApiError';
  }
}

export class RegistryApi {
  /**
   * Get the default registry status
   */
  static async getDefaultRegistry(): Promise<Registry | null> {
    try {
      // Execute: container registry default inspect
      const response = await fetch('/api/registry/default/inspect');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get default registry');
      }

      // Parse the registry info from the response
      // This would need to be adjusted based on actual API response format
      return {
        id: 'default',
        name: data.name || 'Default Registry',
        url: data.url || '',
        username: data.username,
        isLoggedIn: data.isLoggedIn || false,
        isDefault: true,
        lastLogin: data.lastLogin
      };
    } catch (error) {
      console.error('Failed to get default registry:', error);
      return null;
    }
  }

  /**
   * Login to registry
   */
  static async login(loginRequest: LoginRequest): Promise<void> {
    try {
      // Execute: container registry login <registry-url> -u <username> -p <password>
      const response = await fetch('/api/registry/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Registry login failed:', error);
      throw error;
    }
  }

  /**
   * Logout from registry
   */
  static async logout(registryUrl: string): Promise<void> {
    try {
      // Execute: container registry logout <registry-url>
      const response = await fetch('/api/registry/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: registryUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Registry logout failed:', error);
      throw error;
    }
  }

  /**
   * Set default registry
   */
  static async setDefault(registryUrl: string): Promise<void> {
    try {
      // Execute: container registry default set <registry-url>
      const response = await fetch('/api/registry/default/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: registryUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to set default registry');
      }
    } catch (error) {
      console.error('Failed to set default registry:', error);
      throw error;
    }
  }
}