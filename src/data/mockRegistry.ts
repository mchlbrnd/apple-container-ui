import { Registry } from "@/types/registry";

export const mockRegistry: Registry = {
  id: "default",
  name: "Default Registry",
  url: "https://index.docker.io/v1/",
  username: "myusername",
  isLoggedIn: true,
  isDefault: true,
  lastLogin: "2024-01-15T10:30:00Z"
};