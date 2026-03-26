export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = import.meta.env.VITE_API_URL || 'https://preflopai.netlify.app/api';
const TOKEN_KEY = 'poker_trainer_token';

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthHeaders(): HeadersInit {
    return this.token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` }
      : { 'Content-Type': 'application/json' };
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        });
      }
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          return null;
        }
        throw new Error('Failed to get user');
      }

      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
