export interface SystemStatus {
  isRunning: boolean;
  version: string;
  uptime: string;
  lastStarted?: string;
  lastStopped?: string;
}

export interface DNSEntry {
  id: string;
  hostname: string;
  ipAddress: string;
  isDefault: boolean;
  type: 'A' | 'AAAA' | 'CNAME';
  createdAt: string;
}

export interface DebugLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface AddDNSRequest {
  hostname: string;
  ipAddress: string;
  type: 'A' | 'AAAA' | 'CNAME';
}