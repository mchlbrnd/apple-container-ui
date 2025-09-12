export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting' | 'removing' | 'created';
  ports: string[];
  created: string;
  cpu?: number;
  memory?: number;
  command?: string;
  state?: string;
  uptime?: string;
}

export interface ContainerStats {
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  blockIn: number;
  blockOut: number;
}