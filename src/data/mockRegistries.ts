import { Registry } from "@/types/registry";

export const mockRegistries: Registry[] = [
  {
    id: "docker-hub",
    name: "Docker Hub",
    url: "https://index.docker.io/v1/",
    username: "myusername",
    isLoggedIn: true,
    isDefault: true,
    lastLogin: "2024-01-15T10:30:00Z"
  },
  {
    id: "ghcr",
    name: "GitHub Container Registry",
    url: "ghcr.io",
    username: "github-user",
    isLoggedIn: true,
    isDefault: false,
    lastLogin: "2024-01-14T15:20:00Z"
  },
  {
    id: "private-registry",
    name: "Private Registry",
    url: "registry.company.com",
    isLoggedIn: false,
    isDefault: false
  },
  {
    id: "aws-ecr",
    name: "AWS ECR",
    url: "123456789.dkr.ecr.us-west-2.amazonaws.com",
    isLoggedIn: false,
    isDefault: false
  }
];