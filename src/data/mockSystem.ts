import { SystemStatus, DNSEntry, DebugLog } from "@/types/system";

export const mockSystemStatus: SystemStatus = {
  isRunning: true,
  version: "Docker Engine v24.0.7",
  uptime: "7 days, 14 hours, 23 minutes",
  lastStarted: "2024-01-08T09:15:00Z",
};

export const mockDNSEntries: DNSEntry[] = [
  {
    id: "dns-1",
    hostname: "registry.local",
    ipAddress: "192.168.1.100",
    isDefault: true,
    type: "A",
    createdAt: "2024-01-10T10:30:00Z"
  },
  {
    id: "dns-2", 
    hostname: "api.local",
    ipAddress: "192.168.1.101",
    isDefault: false,
    type: "A",
    createdAt: "2024-01-11T15:20:00Z"
  },
  {
    id: "dns-3",
    hostname: "db.local",
    ipAddress: "2001:db8::1",
    isDefault: false,
    type: "AAAA",
    createdAt: "2024-01-12T09:45:00Z"
  }
];

export const mockDebugLogs: DebugLog[] = [
  {
    id: "log-1",
    timestamp: "2024-01-15T10:30:15Z",
    level: "info",
    message: "Docker daemon started successfully"
  },
  {
    id: "log-2",
    timestamp: "2024-01-15T10:30:20Z",
    level: "info", 
    message: "API server listening on unix:///var/run/docker.sock"
  },
  {
    id: "log-3",
    timestamp: "2024-01-15T10:31:00Z",
    level: "warning",
    message: "Container registry connection timeout, retrying..."
  },
  {
    id: "log-4",
    timestamp: "2024-01-15T10:31:05Z",
    level: "info",
    message: "Successfully connected to container registry"
  }
];