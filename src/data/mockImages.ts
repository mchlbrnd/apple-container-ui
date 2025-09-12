import { DockerImage } from "@/types/image";

export const mockImages: DockerImage[] = [
  {
    id: "sha256:nginx123",
    name: "nginx",
    tag: "latest",
    digest: "sha256:0d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b31",
    size: "187MB",
    created: "2024-01-15T10:30:00Z",
    registry: "local",
    architecture: "amd64",
    os: "linux",
    layers: [
      {
        id: "sha256:layer1",
        size: "77MB",
        command: "ADD file:1234 / # buildkit"
      },
      {
        id: "sha256:layer2", 
        size: "55MB",
        command: "RUN apt-get update && apt-get install -y nginx"
      },
      {
        id: "sha256:layer3",
        size: "55MB", 
        command: "COPY nginx.conf /etc/nginx/nginx.conf"
      }
    ],
    history: [
      {
        created: "2024-01-15T10:30:00Z",
        createdBy: "/bin/sh -c #(nop) ADD file:1234 /",
        size: "77MB"
      },
      {
        created: "2024-01-15T10:28:00Z",
        createdBy: "/bin/sh -c apt-get update && apt-get install -y nginx",
        size: "55MB"
      }
    ]
  },
  {
    id: "sha256:redis456",
    name: "redis",
    tag: "7.2",
    digest: "sha256:1d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b32",
    size: "116MB",
    created: "2024-01-14T15:20:00Z",
    registry: "local",
    architecture: "amd64",
    os: "linux",
    layers: [
      {
        id: "sha256:redis-layer1",
        size: "77MB",
        command: "ADD file:5678 / # buildkit"
      },
      {
        id: "sha256:redis-layer2",
        size: "39MB",
        command: "RUN apt-get update && apt-get install -y redis-server"
      }
    ],
    history: [
      {
        created: "2024-01-14T15:20:00Z",
        createdBy: "/bin/sh -c #(nop) ADD file:5678 /",
        size: "77MB"
      },
      {
        created: "2024-01-14T15:18:00Z",
        createdBy: "/bin/sh -c apt-get update && apt-get install -y redis-server",
        size: "39MB"
      }
    ]
  },
  {
    id: "sha256:postgres789",
    name: "postgres",
    tag: "15",
    digest: "sha256:2d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b33",
    size: "376MB",
    created: "2024-01-13T09:15:00Z",
    registry: "remote",
    architecture: "amd64",
    os: "linux"
  },
  {
    id: "sha256:node101",
    name: "node",
    tag: "18-alpine",
    digest: "sha256:3d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b34",
    size: "174MB",
    created: "2024-01-12T14:45:00Z",
    registry: "local",
    architecture: "amd64",
    os: "linux"
  }
];