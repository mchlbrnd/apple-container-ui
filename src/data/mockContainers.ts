import { Container } from "@/types/container";

export const mockContainers: Container[] = [
  {
    id: "c1234567890abcdef1234567890abcdef1234567890abcdef",
    name: "webapp-frontend",
    image: "node:18-alpine",
    status: "running",
    ports: ["3000:3000", "3001:3001"],
    created: "2024-01-15T10:30:00Z",
    cpu: 23.5,
    memory: 512 * 1024 * 1024,
    command: "npm start",
    uptime: "2 hours"
  },
  {
    id: "d2345678901bcdef2345678901bcdef2345678901bcdef9",
    name: "database-postgres", 
    image: "postgres:15",
    status: "running",
    ports: ["5432:5432"],
    created: "2024-01-14T08:15:00Z",
    cpu: 12.1,
    memory: 256 * 1024 * 1024,
    command: "postgres",
    uptime: "1 day"
  },
  {
    id: "e3456789012cdef3456789012cdef3456789012cdef34",
    name: "redis-cache",
    image: "redis:7-alpine",
    status: "running",
    ports: ["6379:6379"],
    created: "2024-01-14T08:20:00Z",
    cpu: 5.2,
    memory: 64 * 1024 * 1024,
    command: "redis-server",
    uptime: "1 day"
  },
  {
    id: "f4567890123def4567890123def4567890123def456",
    name: "nginx-proxy",
    image: "nginx:alpine",
    status: "stopped",
    ports: ["80:80", "443:443"],
    created: "2024-01-13T14:45:00Z",
    command: "nginx -g daemon off;",
  },
  {
    id: "a5678901234ef5678901234ef5678901234ef56789",
    name: "monitoring-grafana",
    image: "grafana/grafana:latest",
    status: "paused",
    ports: ["3030:3000"],
    created: "2024-01-12T16:00:00Z",
    cpu: 0,
    memory: 128 * 1024 * 1024,
    command: "/run.sh",
  },
  {
    id: "b6789012345f6789012345f6789012345f67890123",
    name: "api-backend",
    image: "python:3.11-slim",
    status: "restarting",
    ports: ["8000:8000"],
    created: "2024-01-15T11:15:00Z",
    command: "python app.py",
  }
];