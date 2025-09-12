export interface Registry {
  id: string;
  name: string;
  url: string;
  username?: string;
  isLoggedIn: boolean;
  isDefault: boolean;
  lastLogin?: string;
}

export interface LoginRequest {
  url: string;
  username: string;
  password: string;
}