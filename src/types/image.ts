export interface Image {
  reference: string;
  descriptor: {
    digest: string;
    size: number;
    mediaType: string;
  };
  // Derived fields for UI convenience
  repository?: string;
  tag?: string;
}

// Keep legacy interface for compatibility during transition
export interface DockerImage extends Image {
  id: string;
  name: string;
}

export interface ImageLayer {
  id: string;
  size: string;
  command: string;
}

export interface ImageHistoryEntry {
  created: string;
  createdBy: string;
  size: string;
  comment?: string;
}

export interface PullImageRequest {
  registry: string;
  username?: string;
  password?: string;
}

export interface BuildImageRequest {
  contextPath: string;
  dockerfilePath: string;
  tag: string;
}