export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting' | 'removing' | 'created' | 'exited';
  ports: string[];
  networks?: ContainerNetwork[];
  labels?: Record<string, string>;
  configuration?: ContainerConfiguration;
}

export interface ContainerNetwork {
  network: string;
  address?: string;
  gateway?: string;
  hostname?: string;
}

export interface ContainerConfiguration {
  id: string;
  image: {
    reference: string;
    descriptor: {
      mediaType: string;
      digest: string;
      size: number;
    };
  };
  publishedPorts: PublishedPort[];
  networks: NetworkConfig[];
  labels: Record<string, string>;
  resources: {
    memoryInBytes: number;
    cpus: number;
  };
  mounts: any[];
}

export interface PublishedPort {
  hostPort: number;
  containerPort: number;
  protocol: string;
}

export interface NetworkConfig {
  network: string;
  options: {
    hostname: string;
  };
}

export interface ContainerStats {
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  blockIn: number;
  blockOut: number;
}