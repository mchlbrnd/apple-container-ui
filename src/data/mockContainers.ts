import { Container } from "@/types/container";

export const mockContainers: Container[] = [
  {
    id: "c1234567890abcdef1234567890abcdef1234567890abcdef",
    name: "webapp-frontend",
    image: "node:18-alpine",
    status: "running",
    ports: ["3000:3000", "3001:3001"],
  },
  {
    id: "d2345678901bcdef2345678901bcdef2345678901bcdef9",
    name: "database-postgres", 
    image: "postgres:15",
    status: "running",
    ports: ["5432:5432"],
  },
  {
    id: "e3456789012cdef3456789012cdef3456789012cdef34",
    name: "redis-cache",
    image: "redis:7-alpine",
    status: "running",
    ports: ["6379:6379"],
  },
  {
    id: "f4567890123def4567890123def4567890123def456",
    name: "nginx-proxy",
    image: "nginx:alpine",
    status: "stopped",
    ports: ["80:80", "443:443"],
  },
  {
    id: "a5678901234ef5678901234ef5678901234ef56789",
    name: "monitoring-grafana",
    image: "grafana/grafana:latest",
    status: "created",
    ports: ["3030:3000"],
  },
  {
    id: "b6789012345f6789012345f6789012345f67890123",
    name: "api-backend",
    image: "python:3.11-slim",
    status: "restarting",
    ports: ["8000:8000"],
  }
];