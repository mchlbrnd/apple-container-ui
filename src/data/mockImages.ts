import { DockerImage } from "@/types/image";

export const mockImages: DockerImage[] = [
  {
    reference: "docker.io/library/nginx:latest",
    descriptor: {
      digest: "sha256:0d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b31",
      size: 196157440,
      mediaType: "application/vnd.oci.image.index.v1+json"
    },
    repository: "docker.io/library/nginx",
    tag: "latest",
    id: "sha256:0d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b31",
    name: "nginx"
  },
  {
    reference: "docker.io/library/redis:7.2",
    descriptor: {
      digest: "sha256:1d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b32",
      size: 121634816,
      mediaType: "application/vnd.oci.image.index.v1+json"
    },
    repository: "docker.io/library/redis",
    tag: "7.2",
    id: "sha256:1d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b32",
    name: "redis"
  },
  {
    reference: "postgres:15",
    descriptor: {
      digest: "sha256:2d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b33",
      size: 394264576,
      mediaType: "application/vnd.oci.image.index.v1+json"
    },
    repository: "postgres",
    tag: "15",
    id: "sha256:2d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b33",
    name: "postgres"
  },
  {
    reference: "node:18-alpine",
    descriptor: {
      digest: "sha256:3d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b34",
      size: 182452224,
      mediaType: "application/vnd.oci.image.index.v1+json"
    },
    repository: "node",
    tag: "18-alpine",
    id: "sha256:3d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b34",
    name: "node"
  }
];