export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  access_token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
}

export interface Session {
  username: string;
  accessToken: string;
}
