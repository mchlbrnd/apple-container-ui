export interface DockerImage {
  id: string;
  name: string;
  tag: string;
  digest: string;
  size: string;
  created: string;
  registry: 'local' | 'remote';
  architecture?: string;
  os?: string;
  layers?: ImageLayer[];
  history?: ImageHistoryEntry[];
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