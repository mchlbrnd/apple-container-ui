import { Image, DockerImage } from '@/types/image';

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

export class ImageApiError extends Error {
  constructor(message: string, public code?: number, public stderr?: string) {
    super(message);
    this.name = 'ImageApiError';
  }
}

export class ImageApi {
  private static checkApi() {
    if (!window.api) {
      throw new ImageApiError('Docker API is not available. Please ensure the application is running in the correct environment.');
    }
    return window.api;
  }

  static async listImages(): Promise<DockerImage[]> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'list', '--format', 'json']);
    
    if (result.code !== 0) {
      throw new ImageApiError('Failed to list images', result.code, result.stderr);
    }

    try {
      const rawImages = JSON.parse(result.stdout);
      
      // Transform the raw image data to DockerImage interface for compatibility
      const images: DockerImage[] = rawImages.map((raw: any) => {
        // Parse reference to extract repository and tag
        const reference = raw.reference || '';
        const refParts = reference.split(':');
        const tag = refParts.length > 1 ? refParts[refParts.length - 1] : 'latest';
        const repository = refParts.slice(0, -1).join(':') || reference;
        
        return {
          reference: raw.reference,
          descriptor: raw.descriptor,
          repository,
          tag,
          // Legacy fields for compatibility
          id: raw.descriptor?.digest || raw.reference,
          name: repository.split('/').pop() || repository,
        };
      });
      
      return images;
    } catch (error) {
      throw new ImageApiError('Failed to parse image list response');
    }
  }

  static async inspectImage(imageTag: string): Promise<any> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'inspect', imageTag, '--format', 'json']);
    
    if (result.code !== 0) {
      throw new ImageApiError(`Failed to inspect image ${imageTag}`, result.code, result.stderr);
    }

    try {
      return JSON.parse(result.stdout);
    } catch (error) {
      throw new ImageApiError('Failed to parse image inspect response');
    }
  }

  static async pullImage(registry: string, username?: string, password?: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'pull', registry]);
    
    if (result.code !== 0) {
      throw new ImageApiError(`Failed to pull image ${registry}`, result.code, result.stderr);
    }
  }

  static async buildImage(options: {
    tag: string;
    contextPath: string;
    dockerfilePath: string;
  }): Promise<void> {
    const api = this.checkApi();
    const args = ['image', 'build', '-t', options.tag, '-f', options.dockerfilePath, options.contextPath];
    
    const result = await api.exec('container', args);
    
    if (result.code !== 0) {
      throw new ImageApiError(`Failed to build image ${options.tag}`, result.code, result.stderr);
    }
  }

  static async tagImage(existingTag: string, newTag: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'tag', existingTag, newTag]);
    
    if (result.code !== 0) {
      throw new ImageApiError(`Failed to tag image ${existingTag}`, result.code, result.stderr);
    }
  }

  static async pushImage(imageTag: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'push', imageTag]);
    
    if (result.code !== 0) {
      throw new ImageApiError(`Failed to push image ${imageTag}`, result.code, result.stderr);
    }
  }

  static async deleteImage(imageTag: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'delete', imageTag]);
    
    if (result.code !== 0) {
      throw new ImageApiError(`Failed to delete image ${imageTag}`, result.code, result.stderr);
    }
  }

  static async pruneImages(): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'prune', '--all']);
    
    if (result.code !== 0) {
      throw new ImageApiError('Failed to prune images', result.code, result.stderr);
    }
  }

  static async loadImage(filePath: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'load', '-i', filePath]);
    
    if (result.code !== 0) {
      throw new ImageApiError(`Failed to load image from ${filePath}`, result.code, result.stderr);
    }
  }

  static async saveImage(imageTag: string, filePath: string): Promise<void> {
    const api = this.checkApi();
    const result = await api.exec('container', ['image', 'save', '-o', filePath, imageTag]);
    
    if (result.code !== 0) {
      throw new ImageApiError(`Failed to save image ${imageTag}`, result.code, result.stderr);
    }
  }
}